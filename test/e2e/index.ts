/* eslint-disable no-console */

// TODO: Write tests to verify each feature of the app works:
//  - source code in vs output
//  - on-screen virtual console
//  - "Auto compile on input"
//  - "Compile" button
//  - "Clear Output" button
//  - editor has line numbers
//  - editor works as expected
//  - view looks correct on desktop screen size
//  - view looks correct on mobile screen size
//  - view looks correct on tablet screen size
//  - headings are visible

import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import {
  cleanupPage,
  renderPage,
  setup,
  sleep,
  teardown,
  TestContext,
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
  assert.ok(await context.page.$('#alert'), 'has #alert element');
  assert.ok(await context.page.$('#nav'), 'has #nav element');
  assert.ok(await context.page.$('#in'), 'has #in element');
  assert.ok(await context.page.$('#out'), 'has #out element');
  assert.ok(await context.page.$('#con'), 'has #con element');
  assert.ok(await context.page.$('#foot'), 'has #foot element');
  assert.ok(
    await context.page.$('a[href="https://maxmilton.github.io/ekscss"]'),
    'has link to the ekscss docs',
  );

  // TODO: Footer contains ekscss version
  // TODO: Footer contains REPL version

  assert.is(context.unhandledErrors.length, 0, 'zero unhandled errors');
});

test('only entries in console are "log"s', async (context) => {
  await sleep(200);
  assert.is(context.unhandledErrors.length, 0, 'zero unhandled errors');
  assert.is(context.consoleMessages.length, 2); // 1. compile time, 2. AST
  context.consoleMessages.forEach((msg) => {
    assert.is(msg.type(), 'log');
  });
});

test.run();
