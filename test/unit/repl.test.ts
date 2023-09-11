import { afterAll, expect, spyOn, test } from 'bun:test';
import { reset } from '../setup';
import { consoleSpy } from './utils';

// esbuild adds a hash to the filename so we need to find the file path
const html = await Bun.file('dist/index.html').text();
const jsFilename = /index.*\.js/.exec(html)?.[0];

afterAll(reset);

test('finds app JS filename', () => {
  expect(jsFilename).toBeTruthy();
});

test('renders entire REPL app', async () => {
  const checkConsoleCalls = consoleSpy();
  const consoleLogSpy = spyOn(console, 'log')
    // @ts-expect-error - noop mock
    .mockImplementation(() => {});

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  await import(`../../dist/${jsFilename!}`);
  await happyDOM.whenAsyncComplete();

  // TODO: Better assertions
  expect(document.body.innerHTML.length).toBeGreaterThan(1000);
  const firstNode = document.body.firstChild as HTMLDivElement;
  expect(firstNode).toBeInstanceOf(window.HTMLDivElement);
  expect(firstNode.id).toBe('alert');
  expect(firstNode.nextSibling).toBeInstanceOf(window.HTMLDivElement);
  expect((firstNode.nextSibling as HTMLDivElement).id).toBe('app');
  expect(document.querySelector('#nav')).toBeTruthy();
  expect(document.querySelector('#in')).toBeTruthy();
  expect(document.querySelector('#out')).toBeTruthy();
  expect(document.querySelector('#con')).toBeTruthy();
  expect(document.querySelector('#foot')).toBeTruthy();

  expect(consoleLogSpy).toHaveBeenCalledTimes(2); // 1. AST, 2. Compile time
  consoleLogSpy.mockReset();
  checkConsoleCalls();
});
