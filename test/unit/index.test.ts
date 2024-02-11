import { describe, expect, test } from 'bun:test';
import { readdir } from 'node:fs/promises';

describe('dist files', () => {
  // FIXME: The bun file type is just inferred from the file extension, not the
  // underlying file data... so that part of this test is not very useful.

  // XXX: Files with unknown type (e.g., symlinks) fall back to the default
  // "application/octet-stream". Bun.file() does not resolve symlinks so it's
  // safe to infer that all these files are therefore regular files.
  const distFiles: [filename: string, type: string, minBytes?: number, maxBytes?: number][] = [
    ['app.webmanifest', 'application/manifest+json', 230, 250],
    ['apple-touch-icon.png', 'image/png', 3706, 3708],
    ['favicon.ico', 'image/x-icon', 4285, 4287],
    ['favicon.svg', 'image/svg+xml', 400, 420],
    ['google-touch-icon.png', 'image/png', 9873, 9875],
    ['humans.txt', 'text/plain;charset=utf-8', 100, 200],
    ['index.css', 'text/css', 5000, 7000],
    ['index.html', 'text/html;charset=utf-8', 600, 700],
    ['index.js', 'text/javascript;charset=utf-8', 8000, 12_000],
    ['index.js.map', 'application/json;charset=utf-8'],
    ['robots.txt', 'text/plain;charset=utf-8', 20, 30],
  ];

  for (const [filename, type, minBytes, maxBytes] of distFiles) {
    // eslint-disable-next-line @typescript-eslint/no-loop-func
    describe(filename, () => {
      const file = Bun.file(`dist/${filename}`);

      test('exists with correct type', () => {
        expect(file.exists()).resolves.toBeTruthy();
        expect(file.size).toBeGreaterThan(0);
        expect(file.type).toBe(type); // TODO: Keep this? Type seems to be resolved from the file extension, not the file data.
      });

      if (minBytes != null && maxBytes != null) {
        test('is within expected file size limits', () => {
          expect(file.size).toBeGreaterThan(minBytes);
          expect(file.size).toBeLessThan(maxBytes);
        });
      }
    });
  }

  test('contains no extra files', async () => {
    const distDir = await readdir('dist');
    expect(distDir).toHaveLength(distFiles.length);
  });
});
