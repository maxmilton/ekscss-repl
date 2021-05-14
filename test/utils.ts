import { JSDOM } from 'jsdom';
import { addHook } from 'pirates';

// increase limit from 10
global.Error.stackTraceLimit = 100;

const mountedContainers = new Set<HTMLDivElement>();

function mockInnerText() {
  Object.defineProperty(global.window.HTMLElement.prototype, 'innerText', {
    get(this: HTMLElement) {
      const el = this.cloneNode(true) as HTMLElement;
      el.querySelectorAll('script,style').forEach((s) => s.remove());
      return el.textContent;
    },
    set(this: HTMLElement, value: string) {
      this.textContent = value;
    },
  });
}

export function setup(): void {
  if (global.window) {
    throw new Error(
      'JSDOM globals already exist, did you forget to run teardown()?',
    );
  }

  const dom = new JSDOM('<!DOCTYPE html>', {
    pretendToBeVisual: true,
    runScripts: 'dangerously',
    url: 'http://localhost/',
  });

  global.window = dom.window.document.defaultView!;
  global.document = global.window.document;

  // JSDOM doesn't support innerText yet -- https://github.com/jsdom/jsdom/issues/1245
  mockInnerText();
}

export function teardown(): void {
  if (!global.window) {
    throw new Error('No JSDOM globals exist, did you forget to run setup()?');
  }

  // https://github.com/jsdom/jsdom#closing-down-a-jsdom
  global.window.close();
  // @ts-expect-error - cleaning up
  // eslint-disable-next-line no-multi-assign
  global.window = global.document = undefined;
}

export interface RenderResult {
  /** A wrapper DIV which contains your mounted component. */
  container: HTMLDivElement;
  /**
   * A helper to print the HTML structure of the mounted container. The HTML is
   * prettified and may not accurately represent your actual HTML. It's intended
   * for debugging tests only and should not be used in any assertions.
   *
   * @param el - An element to inspect. Default is the mounted container.
   */
  debug(el?: Element): void;
}

export function render(component: Node): RenderResult {
  const container = document.createElement('div');

  container.appendChild(component);
  document.body.appendChild(container);

  mountedContainers.add(container);

  return {
    container,
    debug(el = container) {
      // TODO: Prettify HTML
      console.log('DEBUG:');
      console.log(el.innerHTML);
    },
    // unmount() {
    //   container.removeChild(component);
    // },
  };
}

export function cleanup(): void {
  mountedContainers.forEach((container) => {
    if (container.parentNode === document.body) {
      document.body.removeChild(container);
    }
  });
}

let revertXcssHook: () => void;

export function mocksSetup(): void {
  // Force imported .xcss files to return nothing to prevent test errors (unit
  // tests can't assert CSS properly anyway; better to use playwright!)
  revertXcssHook = addHook(() => '', {
    exts: ['.xcss'],
  });

  // https://github.com/jsdom/jsdom/issues/1742#issuecomment-622335665
  document.execCommand = (
    commandId: string,
    _showUI?: boolean,
    value?: string,
  ) => {
    const node = window.getSelection()?.anchorNode;

    switch (commandId) {
      case 'defaultParagraphSeparator':
        // TODO: Implement something useful here or add `playwright-chromium` for UI tests
        break;

      case 'insertText':
        if (!node) throw new Error('No node selected for insertText');
        if (!value) throw new Error('insertText missing value');

        if (node.textContent) {
          node.textContent += value;
        } else {
          // Text node
          node.parentNode!.textContent += value;
        }
        break;

      default:
        throw new ReferenceError(
          `document.execCommand mock does not support ${commandId}`,
        );
    }

    return true;
  };

  // TODO: Stub only to prevent test errors -- create UI tests in playwright for actual use cases
  global.window.Element.prototype.scrollTo = () => {};
}

export function mocksTeardown(): void {
  revertXcssHook();
}
