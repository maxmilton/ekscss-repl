/* eslint-disable import/no-extraneous-dependencies, no-param-reassign, no-console */

import * as csso from 'csso';
import esbuild from 'esbuild';
import {
  decodeUTF8,
  encodeUTF8,
  minifyTemplates,
  writeFiles,
} from 'esbuild-minify-templates';
import { xcss } from 'esbuild-plugin-ekscss';
import fs from 'fs/promises';
import { gitRef } from 'git-ref';
import path from 'path';
import { PurgeCSS } from 'purgecss';
import * as terser from 'terser';

const mode = process.env.NODE_ENV;
const dev = mode === 'development';
const dir = path.resolve(); // loose alternative to __dirname in node ESM
const release = gitRef();

/**
 * @param {esbuild.OutputFile[]} outputFiles
 * @param {string} ext - File extension to match.
 * @returns {{ file: esbuild.OutputFile; index: number; }}
 */
function findOutputFile(outputFiles, ext) {
  const index = outputFiles.findIndex((outputFile) => outputFile.path.endsWith(ext));
  return { file: outputFiles[index], index };
}

/** @type {esbuild.Plugin} */
const analyzeMeta = {
  name: 'analyze-meta',
  setup(build) {
    if (!build.initialOptions.metafile) return;
    build.onEnd((result) => {
      if (result.metafile) {
        esbuild
          .analyzeMetafile(result.metafile)
          .then(console.log)
          .catch(console.error);
      }
    });
  },
};

/**
 * @param {string} jsPath
 * @param {string} cssPath
 */
function makeHTML(jsPath, cssPath) {
  return `<!doctype html>
<meta charset=utf-8>
<meta name=viewport content="width=device-width">
<meta name=google value=notranslate>
<meta name=theme-color content=#f5f8fa>
<link href=/app.webmanifest rel=manifest>
<link href=/favicon.svg rel=icon>
<link href=/apple-touch-icon.png rel=apple-touch-icon>
<title>ekscss REPL</title>
<link href=/${cssPath} rel=stylesheet>
<script src=https://cdn.jsdelivr.net/npm/trackx@0/default.js crossorigin></script>
<script>window.trackx&&(trackx.setup("https://api.trackx.app/v1/8c6cfd78d7e"),trackx.ping());</script>
<script src=/${jsPath} defer></script>
<noscript>You need to enable JavaScript to run this app.</noscript>`;
}

/** @type {esbuild.Plugin} */
const buildHTML = {
  name: 'build-html',
  setup(build) {
    const distPath = path.join(dir, 'dist');

    build.onEnd(async (result) => {
      if (result.outputFiles) {
        const outJS = findOutputFile(result.outputFiles, '.js');
        const outCSS = findOutputFile(result.outputFiles, '.css');

        const html = makeHTML(
          path.relative(distPath, outJS.file.path),
          path.relative(distPath, outCSS.file.path),
        );

        result.outputFiles[result.outputFiles.length] = {
          path: path.join(distPath, 'index.html'),
          contents: encodeUTF8(html),
          get text() {
            return decodeUTF8(this.contents);
          },
        };
      } else {
        await fs.writeFile(
          path.join(distPath, 'index.html'),
          makeHTML('app.js', 'app.css'),
          'utf8',
        );
      }
    });
  },
};

/** @type {esbuild.Plugin} */
const minifyCSS = {
  name: 'minify-css',
  setup(build) {
    if (build.initialOptions.write !== false) return;

    build.onEnd(async (result) => {
      if (result.outputFiles) {
        const outHTML = findOutputFile(result.outputFiles, '.html');
        const outJS = findOutputFile(result.outputFiles, '.js');
        const outCSS = findOutputFile(result.outputFiles, '.css');

        const purgedcss = await new PurgeCSS().purge({
          content: [
            { extension: '.html', raw: decodeUTF8(outHTML.file.contents) },
            { extension: '.js', raw: decodeUTF8(outJS.file.contents) },
          ],
          css: [{ raw: decodeUTF8(outCSS.file.contents) }],
          safelist: ['html', 'body'],
        });
        const { css } = csso.minify(purgedcss[0].css, {
          restructure: true,
          forceMediaMerge: true, // unsafe!
        });

        result.outputFiles[outCSS.index].contents = encodeUTF8(css);
      }
    });
  },
};

/** @type {esbuild.Plugin} */
const minifyJS = {
  name: 'minify-js',
  setup(build) {
    if (build.initialOptions.write !== false) return;

    build.onEnd(async (result) => {
      if (result.outputFiles) {
        const distPath = path.join(dir, 'dist');
        const outJS = findOutputFile(result.outputFiles, '.js');
        const outMap = findOutputFile(result.outputFiles, '.js.map');

        const { code = '', map = '' } = await terser.minify(
          decodeUTF8(outJS.file.contents),
          {
            ecma: 2020,
            compress: {
              comparisons: false,
              passes: 2,
              inline: 2,
              unsafe: true,
              negate_iife: false,
            },
            format: {
              comments: false,
              ascii_only: true,
              wrap_iife: true,
              wrap_func_args: true,
            },
            sourceMap: {
              content: decodeUTF8(outMap.file.contents),
              filename: path.relative(distPath, outJS.file.path),
              url: path.relative(distPath, outMap.file.path),
            },
          },
        );

        result.outputFiles[outMap.index].contents = encodeUTF8(map.toString());
        result.outputFiles[outJS.index].contents = encodeUTF8(code);
      }
    });
  },
};

await esbuild.build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/app.js',
  entryNames: dev ? '[name]' : '[name]-[hash]',
  assetNames: dev ? '[name]' : '[name]-[hash]',
  chunkNames: dev ? '[name]' : '[name]-[hash]',
  platform: 'browser',
  target: ['chrome60', 'edge79', 'firefox55', 'safari11.1'],
  define: {
    'process.env.APP_RELEASE': JSON.stringify(release),
    'process.env.EKSCSS_VERSION': JSON.stringify(
      process.env.npm_package_dependencies_ekscss,
    ),
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  plugins: [
    xcss(),
    minifyTemplates({ taggedOnly: true }),
    buildHTML,
    minifyCSS,
    minifyJS,
    writeFiles(),
    analyzeMeta,
  ],
  bundle: true,
  minify: !dev,
  sourcemap: true,
  watch: dev,
  write: dev,
  metafile: !dev && process.stdout.isTTY,
  logLevel: 'debug',
});
