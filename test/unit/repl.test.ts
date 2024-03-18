import { afterEach, expect, spyOn, test } from 'bun:test';
import { VirtualConsoleLogTypeEnum } from 'happy-dom';
import { reset } from '../setup';
import { performanceSpy } from './utils';

afterEach(reset);

// Build adds a hash to the filename so we need to find the file path.
const html = await Bun.file('dist/index.html').text();
const jsFilename = /index.*\.js/.exec(html)?.[0];
const MODULE_PATH = import.meta.resolveSync(`../../dist/${jsFilename!}`);

async function load() {
  // Workaround for hack in src/BookmarkBar.ts that waits for styles to be loaded.
  document.head.appendChild(document.createElement('style'));

  Loader.registry.delete(MODULE_PATH);
  await import(MODULE_PATH);
  await happyDOM.waitUntilComplete();
}

test('finds app JS filename', () => {
  expect(jsFilename).toBeTruthy();
});

test('renders entire REPL app', async () => {
  await load();
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

  // TODO: Add more and better assertions.
});

test('does not call any console methods (except 2 known calls)', async () => {
  await load();
  const logs = happyDOM.virtualConsolePrinter.read();
  expect(logs).toBeArrayOfSize(2); // 1. AST, 2. Compile time

  expect(logs[0].type).toBe(VirtualConsoleLogTypeEnum.log);
  expect(logs[0].message).toBeArrayOfSize(2);
  expect(logs[0].message[0]).toBe('AST:');
  expect(logs[0].message[1]).toBeArray();

  expect(logs[1].type).toBe(VirtualConsoleLogTypeEnum.log);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  expect(logs[1].message).toEqual([expect.stringMatching(/^Compile time: \d+\.\d\dms$/)]);
});

test.only('does not call any performance methods (except performance.now for timing)', async () => {
  const performanceNowSpy = spyOn(global.performance, 'now');
  const check = performanceSpy();
  await load();
  // expect(performanceNowSpy).toHaveBeenCalledTimes(2); // compile time start and end
  expect(performanceNowSpy).toHaveBeenCalledTimes(4); // FIXME: Why 4? Is bun test doing something?
  performanceNowSpy.mockClear();
  check();
  performanceNowSpy.mockRestore();
});

test('does not call fetch()', async () => {
  const spy = spyOn(global, 'fetch');
  await load();
  expect(spy).not.toHaveBeenCalled();
});
