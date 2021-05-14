/* eslint-disable import/no-extraneous-dependencies, no-console */

import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import {
  setup,
  teardown,
  renderPage,
  cleanupPage,
  TestContext,
  sleep,
} from './utils';

const test = suite<TestContext>('e2e');

// FIXME: Use hooks normally once issue is fixed -- https://github.com/lukeed/uvu/issues/80
// test.before(setup);
// test.after(teardown);
// test.before.each(renderApp);
// test.after.each(cleanupApp);
test.before(async (context) => {
  try {
    await setup(context);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});
test.after(async (context) => {
  try {
    await teardown(context);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});
test.before.each(async (context) => {
  try {
    await renderPage(context);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});
test.after.each(async (context) => {
  try {
    await cleanupPage(context);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});

test('renders entire REPL app', async (context) => {
  assert.ok(await context.page.$('#nav'));
  assert.ok(await context.page.$('#in'));
  assert.ok(await context.page.$('#out'));
  assert.ok(await context.page.$('#con'));
  assert.ok(await context.page.$('#foot'));
});

test('only entries in console are "log"s', async (context) => {
  await sleep(200);
  assert.is(context.consoleMessages.length, 2); // 1. compile time, 2. AST
  context.consoleMessages.forEach((msg) => {
    assert.is(msg.type(), 'log');
  });
});

test.run();
