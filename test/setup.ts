import "@maxmilton/test-utils/extend";
import { setupDOM } from "@maxmilton/test-utils/dom";

// HACK: Make imported .xcss files return empty to prevent test errors.
// oxlint-disable-next-line vitest/require-hook
Bun.plugin({
  name: "xcss",
  setup(build) {
    build.onLoad({ filter: /\.xcss$/u }, () => ({
      contents: "",
      // loader: 'css',
    }));
  },
});

function setupMocks(): void {
  // Normally this is set by Bun.build
  // process.env.APP_RELEASE = '1.0.0';

  // @ts-expect-error - noop stub
  global.performance.mark = () => {};
  // @ts-expect-error - noop stub
  global.performance.measure = () => {};

  // happy-dom doesn't support `document.execCommand` so we need to mock it
  // REF: https://github.com/jsdom/jsdom/issues/1742#issuecomment-622335665
  // oxlint-disable-next-line typescript/no-deprecated
  document.execCommand = (commandId: string, _showUI?: boolean, value?: string) => {
    const node = window.getSelection()?.anchorNode;

    switch (commandId) {
      case "defaultParagraphSeparator":
        break;

      case "insertText":
        if (!node) throw new Error("No node selected for insertText");
        if (!value) throw new Error("insertText missing value");
        // if (node.textContent) {
        //   node.textContent += value;
        // } else {
        //   node.nodeValue += value; // TEXT_NODE
        // }
        node.textContent += value;
        break;

      default:
        throw new ReferenceError(`document.execCommand mock does not support "${commandId}"`);
    }

    return true;
  };
}

export async function reset(): Promise<void> {
  // oxlint-disable-next-line typescript/no-unnecessary-condition
  if (global.happyDOM) {
    await happyDOM.abort();
    // oxlint-disable-next-line typescript/no-unnecessary-condition
    window?.close();
  }

  setupDOM();
  setupMocks();
}

await reset();
