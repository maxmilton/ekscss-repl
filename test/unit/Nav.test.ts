import { afterEach, expect, test } from 'bun:test';
import { Nav } from '../../src/components/Nav';
import { cleanup, render } from './utils';

afterEach(cleanup);

test('rendered DOM contains expected elements', () => {
  const rendered = render(Nav());
  expect(rendered.container.firstChild?.nodeName).toBe('DIV');
  expect((rendered.container.firstChild as HTMLDivElement).id).toBe('nav');
  expect(rendered.container.querySelector('h1')?.textContent).toBe('ekscss REPL');
  expect(rendered.container.querySelector('h1')?.id).toBe('logo');
  // TODO: Make test less brittle; we have multiple buttons in Nav.
  expect(rendered.container.querySelector('button')?.textContent).toBe('Compile');

  // TODO: More/better assertions
});

test('rendered DOM matches snapshot', () => {
  const rendered = render(Nav());
  expect(rendered.container.innerHTML).toMatchSnapshot();
});
