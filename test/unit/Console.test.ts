import { afterEach, expect, test } from 'bun:test';
import { Console } from '../../src/components/Console';
import { cleanup, render } from './utils';

afterEach(cleanup);

test('rendered DOM contains expected elements', () => {
  const rendered = render(Console());
  expect(rendered.container.firstChild?.nodeName).toBe('DIV');
  expect(rendered.container.querySelector('h2')?.textContent).toBe('Console Output');
  expect(rendered.container.querySelector('.console')).toBeTruthy();

  // TODO: More/better assertions
});

test('rendered DOM matches snapshot', () => {
  const rendered = render(Console());
  expect(rendered.container.innerHTML).toMatchSnapshot();
});
