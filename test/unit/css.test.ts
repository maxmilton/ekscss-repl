import { describe, expect, test } from 'bun:test';
import { DECLARATION, MEDIA, compile, lookup, reduce, walk } from '@maxmilton/test-utils/css';
import xcssConfig from '../../xcss.config';
import { distPath, indexCSS } from './files';

describe('xcss config', () => {
  test('contains only expected plugins', () => {
    expect.assertions(3);
    expect(xcssConfig.plugins).toBeArrayOfSize(3);
    // HACK: We can't use fn.name because the plugins are minified, so we check
    // that a known unique error code is present in the stringified source.
    expect(xcssConfig.plugins?.[0].toString()).toInclude('import-empty'); // @ekscss/plugin-import
    expect(xcssConfig.plugins?.[1].toString()).toInclude('apply-empty'); // @ekscss/plugin-apply
    // TODO: Check for @ekscss/plugin-prefixer
  });
});

const css = await Bun.file(`${distPath}/${indexCSS}`).text();
const ast = compile(css);

test('compiled AST is not empty', () => {
  expect.assertions(1);
  expect(ast).not.toBeEmpty();
});

test('does not contain any @font-face rules', () => {
  expect.assertions(1);
  expect(css).not.toInclude('@font-face');
});

test('does not contain any @import rules', () => {
  expect.assertions(1);
  expect(css).not.toInclude('@import');
});

test('does not contain any comments', () => {
  expect.assertions(4);
  expect(css).not.toInclude('/*');
  expect(css).not.toInclude('*/');
  expect(css).not.toMatch(/(?<!:)\/\//); // "//" but not "://" (URL protocol)
  expect(css).not.toInclude('<!');
});

test('does not have any CSS variable declarations', () => {
  expect.assertions(1);
  let found = 0;
  walk(ast, (element) => {
    if (element.type === DECLARATION && (element.props as string).startsWith('--')) {
      found += 1;
    }
  });
  expect(found).toBe(0);
});

// "@media (min-width:60.01rem)" and "@media (prefers-reduced-motion:reduce)"
test('has exactly 2 @media queries', () => {
  expect.assertions(1);
  let found = 0;
  walk(ast, (element) => {
    if (element.type === MEDIA) {
      found += 1;
    }
  });
  expect(found).toBe(2);
});

test('has a single ":root" selector', () => {
  expect.assertions(1);
  const elements = lookup(ast, ':root');
  expect(elements).toBeArrayOfSize(1);
});

test('.con class has max-width of 50rem', () => {
  expect.assertions(4);
  const elements = lookup(ast, '.con');
  expect(elements).toBeArray();
  expect(elements?.length).toBeGreaterThan(0);
  expect(elements?.[0].props).toContain('.con');
  const styles = reduce(elements!);
  expect(styles).toHaveProperty('max-width', '50rem');
});

const wellKnownSelectors = [
  '.button',
  '.button:hover',
  '.button:active',
  '.button:focus',
  '.button:disabled',
  '.checkbox',
  '.checkbox:checked',
  '.code-block',
  '.editor',
];

for (const selector of wellKnownSelectors) {
  test(`has ${selector} styles`, () => {
    expect.assertions(2);
    const elements = lookup(ast, selector);
    expect(elements).toBeArray();
    expect(elements?.length).toBeGreaterThan(0);
  });
}
