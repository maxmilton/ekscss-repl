/* eslint-disable no-bitwise, no-console */

import type { BunPlugin } from 'bun';
import * as csso from 'csso';
import * as xcss from 'ekscss';
import * as lightningcss from 'lightningcss';
import { PurgeCSS } from 'purgecss';
import * as terser from 'terser';
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

let css = '';

// XXX: Temporary workaround to build CSS until Bun.build supports css loader
const extractCSS: BunPlugin = {
  name: 'extract-css',
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      css += await Bun.file(args.path).text();
      return { contents: '' };
    });
    build.onLoad({ filter: /\.xcss$/ }, async (args) => {
      const source = await Bun.file(args.path).text();
      const compiled = xcss.compile(source, {
        from: args.path,
        globals: xcssConfig.globals,
        plugins: xcssConfig.plugins,
      });

      for (const warning of compiled.warnings) {
        console.error('XCSS:', warning.message);

        if (warning.file) {
          console.log(
            `  at ${[warning.file, warning.line, warning.column]
              .filter(Boolean)
              .join(':')}`,
          );
        }
      }

      css += compiled.css;
      return { contents: '' };
    });
  },
};

console.time('build');
const out = await Bun.build({
  entrypoints: ['src/index.ts'],
  outdir: 'dist',
  target: 'browser',
  // FIXME: Consider using iife once bun supports it.
  // format: 'iife',
  define: {
    'process.env.APP_RELEASE': JSON.stringify(release),
    'process.env.EKSCSS_VERSION': JSON.stringify(pkg.dependencies.ekscss),
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  loader: {
    '.svg': 'text',
  },
  plugins: [extractCSS],
  minify: !dev,
  sourcemap: 'external',
});
console.timeEnd('build');
console.log(out);

async function minifyCSS() {
  const js = await out.outputs[0].text();
  const purged = await new PurgeCSS().purge({
    content: [{ extension: '.js', raw: js }],
    css: [{ raw: css }],
    safelist: ['html', 'body'],
    blocklist: ['object', 'source'],
  });
  const minified = lightningcss.transform({
    filename: 'index.css',
    code: Buffer.from(purged[0].css),
    minify: true,
    targets: {
      chrome: 80 << 16,
      edge: 80 << 16,
      firefox: 72 << 16,
      safari: (13 << 16) | (1 << 8),
    },
  });

  for (const warning of minified.warnings) {
    console.error('CSS:', warning.message);
  }

  const minified2 = csso.minify(minified.code.toString(), {
    filename: 'popup.css',
    forceMediaMerge: true, // somewhat unsafe!
  });

  await Bun.write('dist/index.css', minified2.css);
}

async function minifyJS(artifact: Blob & { path: string }) {
  let source = await artifact.text();

  // Improve var collapsing; terser doesn't do this so we do it manually
  source = source.replaceAll('const ', 'let ');

  const result = await terser.minify(source, {
    ecma: 2016, // chrome 60 (2017)
    module: true,
    compress: {
      // Prevent functions being inlined
      reduce_funcs: false,
      // XXX: Comment out to keep performance markers for debugging
      pure_funcs: ['performance.mark', 'performance.measure'],
      passes: 2,
    },
    mangle: {
      properties: {
        regex: /^\$\$/,
      },
    },
  });

  await Bun.write(artifact.path, result.code!);
}

async function buildHTML() {
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
    <link href=/index.css rel=stylesheet>
    <script src=https://cdn.jsdelivr.net/npm/trackx@0/default.js crossorigin></script>
    <script>window.trackx&&(trackx.setup("https://api.trackx.app/v1/8c6cfd78d7e"),trackx.ping());</script>
    <script src=/index.js defer></script>
    <noscript>You need to enable JavaScript to run this app.</noscript>
  `
    .trim()
    .replace(/\n\s+/g, '\n'); // remove leading whitespace

  await Bun.write('dist/index.html', html);
}

if (dev) {
  await Bun.write('dist/index.css', css);
} else {
  console.time('minifyCSS');
  await minifyCSS();
  console.timeEnd('minifyCSS');

  console.time('minifyJS');
  await minifyJS(out.outputs[0]);
  console.timeEnd('minifyJS');
}

console.time('buildHTML');
await buildHTML();
console.timeEnd('buildHTML');
