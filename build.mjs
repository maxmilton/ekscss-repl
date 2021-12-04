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
import { minify } from 'terser';

const mode = process.env.NODE_ENV;
const dev = mode === 'development';
const dir = path.resolve(); // no __dirname in node ESM
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
    // @ts-expect-error - FIXME:!
    build.onEnd((result) => esbuild.analyzeMetafile(result.metafile).then(console.log));
  },
};

/**
 * @param {string} jsPath
 * @param {string} cssPath
 */
function makeHtml(jsPath, cssPath) {
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
const buildHtml = {
  name: 'build-html',
  setup(build) {
    const distPath = path.join(dir, 'dist');

    build.onEnd(async (result) => {
      if (result.outputFiles) {
        const outputJs = findOutputFile(result.outputFiles, '.js').file;
        const outputCss = findOutputFile(result.outputFiles, '.css').file;

        const html = makeHtml(
          path.relative(distPath, outputJs.path),
          path.relative(distPath, outputCss.path),
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
          makeHtml('app.js', 'app.css'),
          'utf8',
        );
      }
    });
  },
};

/** @type {esbuild.Plugin} */
const minifyCss = {
  name: 'minify-css',
  setup(build) {
    if (build.initialOptions.write !== false) return;

    build.onEnd(async (result) => {
      if (result.outputFiles) {
        const outputHtml = findOutputFile(result.outputFiles, '.html').file;
        const outputJs = findOutputFile(result.outputFiles, '.js').file;
        const { file, index } = findOutputFile(result.outputFiles, '.css');

        const purgedcss = await new PurgeCSS().purge({
          content: [
            { extension: '.html', raw: decodeUTF8(outputHtml.contents) },
            { extension: '.js', raw: decodeUTF8(outputJs.contents) },
          ],
          css: [{ raw: decodeUTF8(file.contents) }],
          safelist: ['html', 'body'],
        });
        const { css } = csso.minify(purgedcss[0].css, {
          restructure: true,
          forceMediaMerge: true, // unsafe!
        });

        result.outputFiles[index].contents = encodeUTF8(css);
      }
    });
  },
};

/** @type {esbuild.Plugin} */
const minifyJs = {
  name: 'minify-js',
  setup(build) {
    if (build.initialOptions.write !== false) return;

    build.onEnd(async (result) => {
      if (result.outputFiles) {
        const distPath = path.join(dir, 'dist');
        const outputJsMap = findOutputFile(result.outputFiles, '.js.map');
        const { file, index } = findOutputFile(result.outputFiles, '.js');

        const { code, map } = await minify(decodeUTF8(file.contents), {
          ecma: 2020,
          compress: {
            comparisons: false,
            passes: 2,
            inline: 2,
            unsafe: true,
          },
          sourceMap: {
            content: decodeUTF8(outputJsMap.file.contents),
            filename: path.relative(distPath, file.path),
            url: path.relative(distPath, outputJsMap.file.path),
          },
        });

        // @ts-expect-error - map is string
        result.outputFiles[outputJsMap.index].contents = encodeUTF8(map);
        // @ts-expect-error - FIXME: code is defined
        result.outputFiles[index].contents = encodeUTF8(code);
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
    buildHtml,
    minifyCss,
    minifyJs,
    writeFiles(),
    analyzeMeta,
  ],
  banner: { js: '"use strict";' },
  bundle: true,
  minify: !dev,
  sourcemap: true,
  watch: dev,
  write: dev,
  metafile: !dev && process.stdout.isTTY,
  logLevel: 'debug',
});
