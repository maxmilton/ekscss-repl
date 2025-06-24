import '@maxmilton/test-utils/extend';

import { setupDOM } from '@maxmilton/test-utils/dom';

// HACK: Make imported .xcss files return empty to prevent test errors.
Bun.plugin({
  name: 'xcss',
  setup(build) {
    build.onLoad({ filter: /\.xcss$/ }, () => ({
      contents: '',
      // loader: 'css',
    }));
  },
});

const noop = () => {};

function setupMocks(): void {
  // normally this is set by Bun.build
  // process.env.APP_RELEASE = '1.0.0';

  // @ts-expect-error - noop stub
  global.performance.mark = noop;
  // @ts-expect-error - noop stub
  global.performance.measure = noop;

  // happy-dom doesn't support `document.execCommand` so we need to mock it
  // REF: https://github.com/jsdom/jsdom/issues/1742#issuecomment-622335665
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  document.execCommand = (commandId: string, _showUI?: boolean, value?: string) => {
    const node = window.getSelection()?.anchorNode;

    switch (commandId) {
      case 'defaultParagraphSeparator':
        // TODO: Implement something useful here?
        break;

      // eslint-disable-next-line unicorn/switch-case-braces
      case 'insertText': {
        if (!node) throw new Error('No node selected for insertText');
        if (!value) throw new Error('insertText missing value');

        // if (node.textContent) {
        //   node.textContent += value;
        // } else {
        //   node.nodeValue += value; // TEXT_NODE
        // }
        node.textContent! += value;
        break;
      }

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
