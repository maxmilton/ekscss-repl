/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-console, unicorn/no-process-exit */

import fs from 'fs';
import path from 'path';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import {
  mocksSetup, mocksTeardown, setup, teardown,
} from './utils';

// esbuild adds a hash to the filename so we need to find the file path
const appJsFilename = /app.*\.js/.exec(
  fs.readFileSync(path.resolve(__dirname, '../dist/index.html'), 'utf8'),
)![0];

// FIXME: Use hooks normally once issue is fixed -- https://github.com/lukeed/uvu/issues/80
// test.before.each(setup);
// test.before.each(mocksSetup);
// test.after.each(mocksTeardown);
// test.after.each(teardown);
test.before.each(() => {
  try {
    setup();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
test.before.each(() => {
  try {
    mocksSetup();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
test.after.each(() => {
  try {
    mocksTeardown();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
test.after.each(() => {
  try {
    teardown();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});

test('renders entire REPL app', () => {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  require(`../dist/${appJsFilename}`);

  // TODO: Better assertions
  assert.is(document.body.innerHTML.length > 1000, true);
  const firstNode = document.body.firstChild as HTMLDivElement;
  // TODO: Update once we remove the WIP alert
  // assert.is((firstNode as HTMLDivElement).id, 'app', 'first element id=app');
  assert.is(firstNode.id, 'alert', 'first element id=alert');
  assert.instance(firstNode, window.HTMLDivElement);
  assert.is((firstNode.nextSibling as HTMLDivElement).id, 'app');
  assert.ok(document.querySelector('#nav'));
  assert.ok(document.querySelector('#in'));
  assert.ok(document.querySelector('#out'));
  assert.ok(document.querySelector('#con'));
  assert.ok(document.querySelector('#foot'));
});

test.run();
