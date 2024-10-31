import { afterEach, expect, test } from 'bun:test';
import { cleanup, render } from '@maxmilton/test-utils/dom';
import { Console } from '../../src/components/Console';

afterEach(cleanup);

test('rendered DOM contains expected elements', () => {
  expect.assertions(3);
  const rendered = render(Console());
  expect(rendered.container.firstChild?.nodeName).toBe('DIV');
  expect(rendered.container.querySelector('h2')?.textContent).toBe('Console Output');
  expect(rendered.container.querySelector('.console')).toBeTruthy();

  // TODO: More/better assertions
});

test('rendered DOM matches snapshot', () => {
  expect.assertions(1);
  const rendered = render(Console());
  expect(rendered.container.innerHTML).toMatchSnapshot();
});
