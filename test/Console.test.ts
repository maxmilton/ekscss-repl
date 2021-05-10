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

test.before(setup);
test.before(mocksSetup);
test.after(mocksTeardown);
test.after(teardown);
test.after.each(cleanup);

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
