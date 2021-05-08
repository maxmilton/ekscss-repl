/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-param-reassign */

import csso from 'csso';
import esbuild from 'esbuild';
import {
  decodeUTF8,
  encodeUTF8,
  minifyTemplates,
  writeFiles,
} from 'esbuild-minify-templates';
import { xcss } from 'esbuild-plugin-ekscss';
import fs from 'fs';
import { gitRef } from 'git-ref';
import path from 'path';
import { PurgeCSS } from 'purgecss';
import { minify } from 'terser';

const mode = process.env.NODE_ENV;
const dev = mode === 'development';
const dir = path.resolve(); // no __dirname in node ESM
const release = gitRef();

// esbuild-minify-templates option
process.env.MINIFY_TAGGED_TEMPLATES_ONLY = 'true';

/** @param {Error|null} err */
function handleErr(err) {
  if (err) throw err;
}

/**
 *
 * @param {esbuild.OutputFile[]} outputFiles
 * @param {string} ext - File extension to match.
 * @returns {{ file: esbuild.OutputFile; index: number; }}
 */
function findOutputFile(outputFiles, ext) {
  const index = outputFiles.findIndex((outputFile) => outputFile.path.endsWith(ext));

  return {
    file: outputFiles[index],
    index,
  };
}

/**
 * Construct a HTML file and save it to disk.
 *
 * @param {string} jsPath
 * @param {string} cssPath
 */
function makeHtml(jsPath, cssPath) {
  return `<!doctype html>
<meta charset=utf-8>
<meta name=viewport content="width=device-width">
<meta name=google value=notranslate>
<link href=/apple-touch-icon.png rel=apple-touch-icon sizes=180x180>
<link href=/favicon-32x32.png rel=icon type=image/png sizes=32x32>
<link href=/favicon-16x16.png rel=icon type=image/png sizes=16x16>
<link href=/app.webmanifest rel=manifest>
<title>ekscss REPL</title>
<meta http-equiv=Content-Security-Policy content="default-src 'none';script-src 'self' 'unsafe-eval' cdn.jsdelivr.net 'sha256-/6UhwfJdAVD14FmUy+KdWA5ndRmzj4wA0ooqXacOhow=';style-src 'self';img-src 'self' data:;manifest-src 'self';connect-src api.trackx.app">
<link href=/${cssPath} rel=stylesheet>
<script src=https://cdn.jsdelivr.net/npm/trackx@0/dist/index.js crossorigin></script>
<script>window.trackx&&trackx.setup('https://api.trackx.app/v1/8c6cfd78d7e/event');</script>
<script src=/${jsPath} defer></script>
<noscript>You need to enable JavaScript to run this app.</noscript>`;
}

/**
 * @param {esbuild.BuildResult} buildResult
 * @returns {Promise<esbuild.BuildResult>}
 */
async function buildHtml(buildResult) {
  const distPath = path.join(dir, 'dist');

  if (buildResult.outputFiles) {
    const outputJs = findOutputFile(buildResult.outputFiles, '.js').file;
    const outputCss = findOutputFile(buildResult.outputFiles, '.css').file;

    const html = makeHtml(
      path.relative(distPath, outputJs.path),
      path.relative(distPath, outputCss.path),
    );

    buildResult.outputFiles[buildResult.outputFiles.length] = {
      path: path.join(distPath, 'index.html'),
      contents: encodeUTF8(html),
      get text() {
        return decodeUTF8(this.contents);
      },
    };
  } else {
    await fs.promises.writeFile(
      path.join(distPath, 'index.html'),
      makeHtml('app.js', 'app.css'),
      'utf8',
    );
  }

  return buildResult;
}

/**
 * @param {esbuild.BuildResult} buildResult
 * @returns {Promise<esbuild.BuildResult>}
 */
async function minifyCss(buildResult) {
  if (buildResult.outputFiles) {
    const outputHtml = findOutputFile(buildResult.outputFiles, '.html').file;
    const outputJs = findOutputFile(buildResult.outputFiles, '.js').file;
    const { file, index } = findOutputFile(buildResult.outputFiles, '.css');

    const purgedcss = await new PurgeCSS().purge({
      content: [
        { extension: '.html', raw: decodeUTF8(outputHtml.contents) },
        { extension: '.js', raw: decodeUTF8(outputJs.contents) },
      ],
      css: [{ raw: decodeUTF8(file.contents) }],
      safelist: ['html', 'body'],
    });
    const { css } = csso.minify(purgedcss[0].css);

    buildResult.outputFiles[index].contents = encodeUTF8(css);
  }

  return buildResult;
}

/**
 * @param {esbuild.BuildResult} buildResult
 * @returns {Promise<esbuild.BuildResult>}
 */
async function minifyJs(buildResult) {
  if (buildResult.outputFiles) {
    const distPath = path.join(dir, 'dist');
    const outputJsMap = findOutputFile(buildResult.outputFiles, '.js.map');
    const { file, index } = findOutputFile(buildResult.outputFiles, '.js');

    const { code, map } = await minify(decodeUTF8(file.contents), {
      ecma: 2020,
      compress: {
        passes: 2,
        unsafe_methods: true,
        unsafe_proto: true,
      },
      sourceMap: {
        content: decodeUTF8(outputJsMap.file.contents),
        filename: path.relative(distPath, file.path),
        url: path.relative(distPath, outputJsMap.file.path),
      },
    });

    // @ts-expect-error - map is string
    buildResult.outputFiles[outputJsMap.index].contents = encodeUTF8(map);
    buildResult.outputFiles[index].contents = encodeUTF8(code);
  }

  return buildResult;
}

esbuild
  .build({
    entryPoints: ['src/index.ts'],
    outfile: 'dist/app.js',
    entryNames: dev ? '[name]' : '[name]-[hash]',
    assetNames: dev ? '[name]' : '[name]-[hash]',
    chunkNames: dev ? '[name]' : '[name]-[hash]',
    platform: 'browser',
    target: ['chrome78', 'firefox77', 'safari11', 'edge44'],
    define: {
      'process.env.APP_VERSION': JSON.stringify(release),
      'process.env.EKSCSS_VERSION': JSON.stringify(
        process.env.npm_package_dependencies_ekscss,
      ),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    plugins: [xcss()],
    banner: { js: '"use strict";' },
    bundle: true,
    minify: !dev,
    sourcemap: true,
    watch: dev,
    write: dev,
    logLevel: 'debug',
  })
  .then(minifyTemplates)
  .then(buildHtml)
  .then(minifyCss)
  .then(minifyJs)
  .then(writeFiles)
  .catch(handleErr);
