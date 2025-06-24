/* eslint-disable no-await-in-loop, no-bitwise, no-console */

import { basename } from 'node:path'; // eslint-disable-line unicorn/import-style
import * as swc from '@swc/core';
import type { BuildArtifact, BunPlugin } from 'bun';
import type { XCSSCompileOptions } from 'ekscss';
import * as xcss from 'ekscss';
import * as lightningcss from 'lightningcss';
import { PurgeCSS, type RawContent } from 'purgecss';
import pkg from './package.json' with { type: 'json' };
import xcssConfig from './xcss.config.ts';

const gitHash = Bun.spawnSync(['git', 'rev-parse', '--short', 'HEAD']).stdout.toString().trim();
const isDirty = Bun.spawnSync(['git', 'diff', '--quiet']).exitCode !== 0;

const mode = Bun.env.NODE_ENV;
const dev = mode === 'development';
const release = `v${pkg.version}-${gitHash}${isDirty ? '-dev' : ''}`;

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
          console.error('XCSS:', warning.message);
          if (warning.file) {
            console.log(
              `  at ${[warning.file, warning.line, warning.column].filter(Boolean).join(':')}`,
            );
          }
        }
        return { contents: compiled.css, loader: 'css' };
      });
    },
  };
}

async function minify(artifacts: BuildArtifact[]): Promise<void> {
  const artifactsJs: BuildArtifact[] = [];
  const artifactsCss: BuildArtifact[] = [];

  const encoder = new TextEncoder();
  const purgecss = new PurgeCSS();
  const content: RawContent[] = [];

  for (const artifact of artifacts) {
    if (artifact.path.endsWith('.js')) {
      artifactsJs.push(artifact);
    } else if (artifact.path.endsWith('.css')) {
      artifactsCss.push(artifact);
    }
  }

  for (const artifact of artifactsJs) {
    if (artifact.kind === 'entry-point' || artifact.kind === 'chunk') {
      const source = await artifact.text();
      const result = await swc.minify(source, {
        ecma: 2020,
        // module: true,
        compress: {
          comparisons: false,
          negate_iife: false,
          reduce_funcs: false,
          passes: 2,

          // XXX: Comment out to keep performance markers for debugging.
          pure_funcs: ['performance.mark', 'performance.measure'],
        },
        format: {
          wrap_func_args: true,
          wrap_iife: true,
        },
        mangle: {
          props: {
            regex: String.raw`^\$\$`,
          },
        },
        sourceMap: Boolean(artifact.sourcemap),
      });

      await Bun.write(artifact.path, result.code);
      if (artifact.sourcemap && result.map) {
        await Bun.write(artifact.sourcemap.path, result.map);
      }
      content.push({ extension: '.js', raw: result.code });
    }
  }

  for (const artifact of artifactsCss) {
    const filename = basename(artifact.path);
    const source = await artifact.text();
    const [purged] = await purgecss.purge({
      content,
      css: [{ raw: source }],
      safelist: ['html', 'body'],
      blocklist: ['object'],
      sourceMap: Boolean(artifact.sourcemap),
    });
    const minified = lightningcss.transform({
      filename,
      code: encoder.encode(purged.css),
      minify: true,
      targets: {
        android: 60 << 16,
        chrome: 60 << 16,
        edge: 79 << 16,
        firefox: 55 << 16,
        ios_saf: (11 << 16) | (1 << 8),
        safari: (11 << 16) | (1 << 8),
      },
      include: lightningcss.Features.Nesting | lightningcss.Features.MediaQueries,
      exclude: lightningcss.Features.LogicalProperties | lightningcss.Features.LightDark,
      sourceMap: Boolean(artifact.sourcemap),
      inputSourceMap: purged.sourceMap!,
    });
    if (minified.warnings.length > 0) console.error(minified.warnings);
    await Bun.write(artifact.path, minified.code);
    if (artifact.sourcemap && minified.map) {
      await Bun.write(artifact.sourcemap.path, minified.map);
    }
  }
}

async function buildHTML(artifacts: BuildArtifact[]) {
  const js = artifacts.find((a) => a.kind === 'entry-point' && a.path.endsWith('.js'));
  const css = artifacts.find((a) => a.kind === 'asset' && a.path.endsWith('.css'));
  if (!js) throw new Error('Could not find JS artifact');
  if (!css) throw new Error('Could not find CSS artifact');

  const cssFile = basename(css.path);
  const jsFile = basename(js.path);

  const html = `
    <!doctype html>
    <html lang=en>
    <meta charset=utf-8>
    <meta name=viewport content="width=device-width">
    <meta name=theme-color content=#f5f8fa>
    <link href=/manifest.webmanifest rel=manifest>
    <link href=/favicon.svg rel=icon>
    <link href=/apple-touch-icon.png rel=apple-touch-icon>
    <title>ekscss REPL</title>
    <link href=/${cssFile} rel=stylesheet>
    <script src=https://io.bugbox.app/v0/bugbox.js crossorigin data-key=AZdUwYn8cACA8WMnLa8QKQ data-release=${release} data-env=${String(process.env.NODE_ENV)} data-ekscss=${pkg.dependencies.ekscss}></script>
    <script src=/${basename(jsFile)} defer></script>
    <noscript>You need to enable JavaScript to run this app.</noscript>
  `
    .trim()
    .replace(/\n\s+/g, '\n'); // remove leading whitespace
  const html404 = `
    <!doctype html>
    <html lang=en>
    <meta charset=utf-8>
    <meta name=viewport content="width=device-width">
    <meta name=theme-color content=#f5f8fa>
    <link href=/favicon.svg rel=icon>
    <title>404 Not Found</title>
    <link href=/${cssFile} rel=stylesheet>
    <body class=ph3>
      <h1>404 Not Found</h1>
      <p>The resource you are looking for does not exist.</p>
  `
    .trim()
    .replace(/\n\s+/g, '\n'); // remove leading whitespace
  await Bun.write('dist/index.html', html);
  await Bun.write('dist/404.html', html404);

  return { cssFile, jsFile };
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
  // format: 'iife',
  define: {
    'process.env.APP_RELEASE': JSON.stringify(release),
    'process.env.EKSCSS_VERSION': JSON.stringify(pkg.dependencies.ekscss),
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  loader: {
    '.svg': 'text',
  },
  plugins: [xcssPlugin(xcssConfig)],
  emitDCEAnnotations: true,
  minify: !dev,
  sourcemap: 'linked',
});
console.timeEnd('build');
console.log(out);
if (!out.success) throw new AggregateError(out.logs, 'Build failed');

console.time('html');
const out2 = await buildHTML(out.outputs);
console.timeEnd('html');

if (!dev) {
  console.time('minify');
  await minify(out.outputs);
  console.timeEnd('minify');
}

console.time('build-info');
await Bun.write(
  'dist/build-info.json',
  JSON.stringify({
    ref: Bun.spawnSync(['git', 'describe', '--always', '--dirty=-dev', '--broken'])
      .stdout.toString()
      .trim(),
    mode,
    css: out2.cssFile,
    js: out2.jsFile,
  }),
);
console.timeEnd('build-info');
