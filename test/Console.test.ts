/* eslint-disable no-console, unicorn/no-process-exit */

import { test } from 'uvu';
import * as assert from 'uvu/assert';
// import { Console } from '../src/components/Console';
import {
  cleanup,
  mocksSetup,
  mocksTeardown,
  render,
  setup,
  teardown,
} from './utils';

type ConsoleComponent = typeof import('../src/components/Console');

// FIXME: Use hooks normally once issue is fixed -- https://github.com/lukeed/uvu/issues/80
// test.before(setup);
// test.before(mocksSetup);
// test.after(mocksTeardown);
// test.after(teardown);
// test.after.each(cleanup);
test.before(() => {
  try {
    setup();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
test.before(() => {
  try {
    mocksSetup();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
test.after(() => {
  try {
    mocksTeardown();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
test.after(() => {
  try {
    teardown();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
test.after.each(() => {
  try {
    cleanup();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});

test('renders correctly', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const { Console } = require('../src/components/Console') as ConsoleComponent;
  const rendered = render(Console());
  assert.snapshot(
    rendered.container.innerHTML,
    `<div id="con">
<h2>Console Output</h2>

<div class="console code-block code"></div></div>`,
  );
});

test.run();
