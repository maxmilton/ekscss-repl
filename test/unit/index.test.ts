// import { validate } from '@maxmilton/test-utils/html';
import { describe, expect, test } from 'bun:test';
import { readdir } from 'node:fs/promises';
import build from '../../dist/build-info.json' with { type: 'json' };

test('index CSS file found', () => {
  expect.assertions(1);
  expect(build.css).toBeDefined();
});

test('index JS file found', () => {
  expect.assertions(1);
  expect(build.js).toBeDefined();
});

describe('dist files', () => {
  // FIXME: The bun file type is just inferred from the file extension, not the
  // underlying file data... so that part of this test is not very useful.

  // XXX: Files with unknown type (e.g., symlinks) fall back to the default
  // "application/octet-stream". Bun.file() does not resolve symlinks so it's
  // safe to infer that all these files are therefore regular files.
  const distFiles: [filename: string, type: string, minBytes?: number, maxBytes?: number][] = [
    ['404.html', 'text/html;charset=utf-8', 300, 500],
    ['android-chrome-192x192.png', 'image/png', 1385, 1387],
    ['android-chrome-512x512.png', 'image/png', 3243, 3245],
    ['apple-touch-icon.png', 'image/png', 1220, 1222],
    ['build-info.json', 'application/json;charset=utf-8'],
    ['favicon.ico', 'image/x-icon', 1149, 1151],
    ['favicon.svg', 'image/svg+xml', 393, 395],
    ['humans.txt', 'text/plain;charset=utf-8', 100, 200],
    [build.css, 'text/css;charset=utf-8', 5000, 7000],
    // TODO: Uncomment once bun supports CSS source maps.
    // [`${indexCSS}.map`, 'application/json;charset=utf-8', 100, 10_000],
    ['index.html', 'text/html;charset=utf-8', 600, 700],
    [build.js, 'text/javascript;charset=utf-8', 8000, 12_000],
    [`${build.js}.map`, 'application/json;charset=utf-8'],
    ['manifest.webmanifest', 'application/manifest+json', 300, 370],
    ['robots.txt', 'text/plain;charset=utf-8', 20, 30],
  ];

  for (const [filename, type, minBytes, maxBytes] of distFiles) {
    describe(filename, () => {
      const file = Bun.file(`dist/${filename}`);

      test('exists with correct type', () => {
        expect.assertions(3);
        expect(file.exists()).resolves.toBeTruthy();
        expect(file.size).toBeGreaterThan(0);
        expect(file.type).toBe(type); // TODO: Keep this? Type seems to be resolved from the file extension, not the file data.
      });

      if (minBytes != null && maxBytes != null) {
        test('is within expected file size limits', () => {
          expect.assertions(2);
          expect(file.size).toBeGreaterThan(minBytes);
          expect(file.size).toBeLessThan(maxBytes);
        });
      }
    });
  }

  test('contains no extra files', async () => {
    expect.assertions(1);
    const distDir = await readdir('dist');
    expect(distDir).toHaveLength(distFiles.length);
  });

  // TODO: Validate HTML once there is a better validator implementation.
  // test.each(distFiles.filter(([filename]) => filename.endsWith('.html')))(
  //   '%s contains valid HTML',
  //   async (filename) => {
  //     const file = Bun.file(`dist/${filename}`);
  //     const html = await file.text();
  //     const result = validate(html);
  //     expect(result.valid).toBeTrue();
  //   },
  // );
});

const indexHTML = await Bun.file('dist/index.html').text();

describe('index.html', () => {
  test('contains the correct title', () => {
    expect.assertions(1);
    expect(indexHTML).toContain('<title>ekscss REPL</title>');
  });

  test('contains the correct CSS filename', () => {
    expect.assertions(1);
    expect(indexHTML).toContain(`<link href=/${build.css} rel=stylesheet>`);
  });

  test('contains the correct JS filename', () => {
    expect.assertions(1);
    expect(indexHTML).toContain(`<script src=/${build.js} defer></script>`);
  });
});

test('index CSS file has hash in filename', () => {
  expect.assertions(1);
  expect(build.css).toMatch(/^index-[\da-z]+\.css$/);
});

test('index JS file has hash in filename', () => {
  expect.assertions(1);
  expect(build.js).toMatch(/^index-[\da-z]+\.js$/);
});
