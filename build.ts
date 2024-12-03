/* eslint-disable no-await-in-loop, no-bitwise, no-console */

import { basename } from 'node:path'; // eslint-disable-line unicorn/import-style
import type { BuildArtifact, BunPlugin } from 'bun';
import * as csso from 'csso';
import type { Usage } from 'csso';
import * as xcss from 'ekscss';
import type { XCSSCompileOptions } from 'ekscss';
import * as lightningcss from 'lightningcss';
import type { Warning } from 'lightningcss';
import { PurgeCSS, type RawContent } from 'purgecss';
import * as terser from 'terser';
import type { MinifyOptions } from 'terser';
import pkg from './package.json' assert { type: 'json' };
import xcssConfig from './xcss.config';

const mode = Bun.env.NODE_ENV;
const dev = mode === 'development';

const release = Bun.spawnSync([
  'git',
  'describe',
  '--always',
  '--dirty=-dev',
  '--broken',
])
  .stdout.toString()
  .trim();

export function xcssPlugin(config: XCSSCompileOptions): BunPlugin {
  return {
    name: 'xcss',
    setup(build) {
      build.onLoad({ filter: /\.xcss$/ }, async (args) => {
        const source = await Bun.file(args.path).text();
        const compiled = xcss.compile(source, {
          from: args.path,
          globals: config.globals,
          plugins: config.plugins,
        });

        for (const warning of compiled.warnings) {
          console.error('[XCSS]', warning.message);

          if (warning.file) {
            console.log(
              `  at ${[warning.file, warning.line, warning.column]
                .filter(Boolean)
                .join(':')}`,
            );
          }
        }

        return { contents: compiled.css, loader: 'css' };
      });
    },
  };
}

/** Print lightningcss compile warnings. */
export function printWarnings(warnings: Warning[]): void {
  for (const warning of warnings) {
    console.error(`[LightningCSS] ${warning.type}:`, warning.message);
    console.log(
      `  at ${warning.loc.filename}:${String(warning.loc.line)}:${String(warning.loc.column)}`,
    );
    if (warning.value) {
      console.log(warning.value);
    }
  }
}

export async function minifyCSS(
  artifacts: BuildArtifact[],
  htmlCode: string,
  safelist: string[] = ['html', 'body'],
  blocklist: Usage['blacklist'] = {},
): Promise<void> {
  const content: RawContent[] = [{ extension: '.html', raw: htmlCode }];
  const purgecss = new PurgeCSS();
  const encoder = new TextEncoder();

  for (const artifact of artifacts) {
    if (artifact.kind === 'entry-point' || artifact.kind === 'chunk') {
      content.push({ extension: '.js', raw: await artifact.text() });
    }
  }

  for (const artifact of artifacts) {
    if (artifact.kind === 'asset' && artifact.path.endsWith('.css')) {
      const filename = basename(artifact.path);
      const source = await artifact.text();
      const purged = await purgecss.purge({
        content,
        css: [
          {
            raw: source
              // HACK: Workaround for JS style sourcemap comments rather than CSS.
              //  ↳ This is a bug in bun: https://github.com/oven-sh/bun/issues/15532
              .replace(/\/\/# debugId=[\w]+\n/, '')
              .replace(
                /\/\/# sourceMappingURL=([-\w.]+\.css\.map)\n?$/,
                '/*# sourceMappingURL=$1 */',
              ),
          },
        ],
        safelist,
      });
      const minified = lightningcss.transform({
        filename,
        code: encoder.encode(purged[0].css),
        minify: true,
        targets: {
          chrome: 60 << 16, // FIXME: Set to >= 123 ?... Actually seems fine with no junk
          edge: 79 << 16,
          firefox: 55 << 16,
          safari: (11 << 16) | (1 << 8),
        },
      });
      printWarnings(minified.warnings);
      const minified2 = csso.minify(minified.code.toString(), {
        filename,
        forceMediaMerge: true, // somewhat unsafe
        usage: {
          blacklist: blocklist,
        },
        // debug: true,
      });

      await Bun.write(artifact.path, minified2.css);
    }
  }
}

export async function minifyJS(
  artifacts: BuildArtifact[],
  options?: Omit<MinifyOptions, 'sourceMap'>,
): Promise<void> {
  for (const artifact of artifacts) {
    if (artifact.kind === 'entry-point' || artifact.kind === 'chunk') {
      const source = await artifact.text();
      const sourceMap = artifact.sourcemap;
      const result = await terser.minify(source, {
        ecma: 2020,
        module: true,
        format: {
          wrap_func_args: true,
          wrap_iife: true,
        },
        compress: {
          comparisons: false,
          negate_iife: false,
          reduce_funcs: false,
        },
        mangle: {
          properties: {
            regex: /^\$\$/,
          },
        },
        ...options,
        sourceMap: sourceMap
          ? {
              content: await sourceMap.text(),
              filename: basename(artifact.path),
              url: basename(sourceMap.path),
            }
          : false,
      });

      if (result.code) {
        await Bun.write(artifact.path, result.code);
      }
      if (sourceMap && result.map) {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        await Bun.write(sourceMap.path, result.map.toString());
      }
    }
  }
}

async function buildHTML(artifacts: BuildArtifact[]) {
  const entrypoint = artifacts.find((a) => a.kind === 'entry-point');
  const css = artifacts.find(
    (a) => a.kind === 'asset' && a.path.endsWith('.css'),
  );
  if (!entrypoint) throw new Error('Could not find entry point JS artifact');
  if (!css) throw new Error('Could not find CSS artifact');

  const html = `
    <!doctype html>
    <meta charset=utf-8>
    <meta name=viewport content="width=device-width">
    <meta name=google value=notranslate>
    <meta name=theme-color content=#f5f8fa>
    <link href=/app.webmanifest rel=manifest>
    <link href=/favicon.svg rel=icon>
    <link href=/apple-touch-icon.png rel=apple-touch-icon>
    <title>ekscss REPL</title>
    <link href=/${basename(css.path)} rel=stylesheet>
    <script src=https://cdn.jsdelivr.net/npm/trackx@0/default.js crossorigin></script>
    <script>window.trackx&&(trackx.setup("https://api.trackx.app/v1/8c6cfd78d7e"),trackx.ping());</script>
    <script src=/${basename(entrypoint.path)} defer></script>
    <noscript>You need to enable JavaScript to run this app.</noscript>
  `
    .trim()
    .replace(/\n\s+/g, '\n'); // remove leading whitespace

  await Bun.write('dist/index.html', html);
  return html;
}

console.time('prebuild');
await Bun.$`rm -rf dist`;
await Bun.$`cp -r static dist`;
console.timeEnd('prebuild');

console.time('build');
const out = await Bun.build({
  entrypoints: ['src/index.ts'],
  outdir: 'dist',
  naming: dev ? '[dir]/[name].[ext]' : '[dir]/[name]-[hash].[ext]',
  target: 'browser',
  format: 'iife',
  define: {
    'process.env.APP_RELEASE': JSON.stringify(release),
    'process.env.EKSCSS_VERSION': JSON.stringify(pkg.dependencies.ekscss),
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  loader: {
    '.svg': 'text',
  },
  plugins: [xcssPlugin(xcssConfig)],
  experimentalCss: true,
  emitDCEAnnotations: true, // for terser
  minify: !dev,
  sourcemap: 'linked',
});
console.timeEnd('build');
console.log(out);
if (!out.success) throw new AggregateError(out.logs, 'Build failed');

console.time('html');
const html = await buildHTML(out.outputs);
console.timeEnd('html');

if (!dev) {
  console.time('minify:css');
  await minifyCSS(out.outputs, html);
  console.timeEnd('minify:css');

  console.time('minify:js');
  await minifyJS(out.outputs, {
    module: false,
    compress: {
      comparisons: false,
      negate_iife: false,
      reduce_funcs: false, // prevent function inlining
      passes: 3,
      // XXX: Comment out to keep performance markers for debugging.
      pure_funcs: ['performance.mark', 'performance.measure'],
    },
  });
  console.timeEnd('minify:js');
}
