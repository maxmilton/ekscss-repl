import { expect } from 'bun:test';
import { GlobalWindow, type Window } from 'happy-dom';

declare global {
  /** Real bun console. `console` is mapped to happy-dom's virtual console. */
  // eslint-disable-next-line no-var, vars-on-top
  var console2: Console;
  // eslint-disable-next-line no-var, vars-on-top
  var happyDOM: Window['happyDOM'];
}

declare module 'bun:test' {
  interface Matchers {
    /** Asserts that a value is a plain `object`. */
    toBePlainObject(): void;
  }
}

expect.extend({
  // XXX: Bun's `toBeObject` matcher is the equivalent of `typeof x === 'object'`.
  toBePlainObject(received: unknown) {
    return Object.prototype.toString.call(received) === '[object Object]'
      ? { pass: true }
      : {
          pass: false,
          message: () => `expected ${String(received)} to be a plain object`,
        };
  },
});

// Make imported .xcss files return empty to prevent test errors (unit tests
// can't assert styles properly anyway; better to create e2e tests!)
Bun.plugin({
  name: 'xcss',
  setup(build) {
    build.onLoad({ filter: /\.xcss$/ }, () => ({
      contents: '',
      // loader: 'css',
    }));
  },
});

const originalConsole = global.console;
const noop = () => {};

function setupDOM() {
  const dom = new GlobalWindow();
  global.happyDOM = dom.happyDOM;
  global.console2 = originalConsole;
  // @ts-expect-error - happy-dom only implements a subset of the DOM API
  global.window = dom.window.document.defaultView;
  global.document = global.window.document;
  global.console = window.console;
  global.fetch = window.fetch;
  global.setTimeout = window.setTimeout;
  global.clearTimeout = window.clearTimeout;
  global.Text = window.Text;
  global.DocumentFragment = window.DocumentFragment;
  global.MutationObserver = window.MutationObserver;
}

function setupMocks(): void {
  // normally this is set by Bun.build
  process.env.APP_RELEASE = '1.0.0';

  // @ts-expect-error - noop stub
  global.performance.mark = noop;
  // @ts-expect-error - noop stub
  global.performance.measure = noop;

  // happy-dom doesn't support `document.execCommand` so we need to mock it
  // REF: https://github.com/jsdom/jsdom/issues/1742#issuecomment-622335665
  document.execCommand = (commandId: string, _showUI?: boolean, value?: string) => {
    const node = window.getSelection()?.anchorNode;

    switch (commandId) {
      case 'defaultParagraphSeparator':
        // TODO: Implement something useful here?
        break;

      case 'insertText':
        if (!node) throw new Error('No node selected for insertText');
        if (!value) throw new Error('insertText missing value');

        // if (node.textContent) {
        //   node.textContent += value;
        // } else {
        //   node.nodeValue += value; // TEXT_NODE
        // }
        node.textContent! += value;
        break;

      default:
        throw new ReferenceError(`document.execCommand mock does not support "${commandId}"`);
    }

    return true;
  };
}

export async function reset(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (global.happyDOM) {
    await happyDOM.abort();
    window.close();
  }

  setupDOM();
  setupMocks();
}

await reset();
