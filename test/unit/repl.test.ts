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
  Loader.registry.delete(MODULE_PATH);
  await import(MODULE_PATH);
  await happyDOM.waitUntilComplete();
}

test('finds app JS filename', () => {
  expect.assertions(1);
  expect(jsFilename).toBeTruthy();
});

test('renders entire REPL app', async () => {
  expect.assertions(10);
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
  expect.assertions(7);
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

test('does not call any performance methods (except performance.now for timing)', async () => {
  // TODO: Use this implementation if happy-dom removes internal performance.now calls.
  // expect.assertions(1);
  // const performanceNowSpy = spyOn(global.performance, 'now');
  // const check = performanceSpy();
  // await load();
  // expect(performanceNowSpy).toHaveBeenCalledTimes(2); // compile time start and end
  // performanceNowSpy.mockClear();
  // check();
  // performanceNowSpy.mockRestore();

  expect.hasAssertions(); // variable number of assertions
  const check = performanceSpy();
  await load();
  check(2); // compile time start and end
});

test('does not call fetch()', async () => {
  expect.assertions(1);
  const spy = spyOn(global, 'fetch');
  await load();
  expect(spy).not.toHaveBeenCalled();
});
