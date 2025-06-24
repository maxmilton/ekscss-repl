import { describe, expect, test } from 'bun:test';
import wrangler from '../../wrangler.jsonc' with { type: 'json' };

describe('static site', () => {
  test('does not contain a worker', () => {
    expect.assertions(1);
    expect(wrangler).not.toHaveProperty('main');
  });

  test('contains an assets directory', () => {
    expect.assertions(1);
    expect(wrangler).toHaveProperty('assets.directory', './dist');
  });

  test('will upload source maps', () => {
    expect.assertions(1);
    expect(wrangler).toHaveProperty('upload_source_maps', true);
  });
});
