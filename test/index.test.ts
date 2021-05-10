/* eslint-disable @typescript-eslint/no-non-null-assertion */

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

test.before.each(setup);
test.before.each(mocksSetup);
test.after.each(mocksTeardown);
test.after.each(teardown);

// test('renders entire REPL app', async () => {
test('renders entire REPL app', () => {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  require(`../dist/${appJsFilename}`);

  // TODO: Better assertions
  assert.is(document.body.innerHTML.length > 1000, true);
  // TODO: Update once we remove the WIP alert
  // assert.is((document.body.firstChild as HTMLDivElement).id, 'app');
  assert.is((document.body.firstChild as HTMLDivElement).id, 'alert');
  assert.is(
    (document.body.firstChild!.nextSibling as HTMLDivElement).id,
    'app',
  );
  assert.ok(document.getElementById('nav'));
  assert.ok(document.getElementById('in'));
  assert.ok(document.getElementById('out'));
  assert.ok(document.getElementById('con'));
  assert.ok(document.getElementById('foot'));
});

test.run();
