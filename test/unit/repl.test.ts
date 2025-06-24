import { afterEach, expect, spyOn, test } from 'bun:test';
import { performanceSpy } from '@maxmilton/test-utils/spy';
import { VirtualConsoleLogTypeEnum } from 'happy-dom';
import { reset } from '../setup.ts';

afterEach(reset);

// Build adds a hash to the filename so we need to find the file path.
const html = await Bun.file('dist/index.html').text();
const jsFilename = /index.*\.js/.exec(html)?.[0];
const MODULE_PATH = Bun.resolveSync(`../../dist/${jsFilename!}`, import.meta.dir);

async function load() {
  Loader.registry.delete(MODULE_PATH);
  await import(MODULE_PATH);
  await happyDOM.waitUntilComplete();
}

const originalNow = performance.now.bind(performance);

function nowSpy() {
  let happydomInternalNowCalls = 0;

  function now() {
    const callerLocation = new Error().stack!.split('\n')[3]; // eslint-disable-line unicorn/error-message
    if (callerLocation.includes('/node_modules/happy-dom/lib/')) {
      happydomInternalNowCalls++;
    }
    return originalNow();
  }

  const spy = spyOn(performance, 'now').mockImplementation(now);

  return /** check */ (calledTimes: number) => {
    // HACK: Workaround for happy-dom calling performance.now internally.
    //  ↳ https://github.com/search?q=repo%3Acapricorn86%2Fhappy-dom%20performance.now&type=code
    expect(spy).toHaveBeenCalledTimes(happydomInternalNowCalls + calledTimes);
    spy.mockRestore();
  };
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
  expect(logs[1].message).toEqual([expect.stringMatching(/^Compile time: \d+\.\d\dms$/)]);
});

test('does not call any performance methods (except performance.now for timing)', async () => {
  // expect.hasAssertions(); // variable number of assertions
  // const performanceNowSpy = spyOn(global.performance, 'now');
  // const check = performanceSpy(['now']);
  // await load();
  // expect(performanceNowSpy).toHaveBeenCalledTimes(2); // compile time start and end
  // performanceNowSpy.mockClear();
  // check();
  // performanceNowSpy.mockRestore();

  expect.hasAssertions(); // variable number of assertions
  const checkNowCalls = nowSpy();
  const check = performanceSpy(['now']);
  await load();
  checkNowCalls(2); // compile time start and end
  check();
});

test('does not call fetch()', async () => {
  expect.assertions(1);
  const spy = spyOn(global, 'fetch');
  await load();
  expect(spy).not.toHaveBeenCalled();
});
