/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { JSDOM } from 'jsdom';
import { addHook } from 'pirates';

// increase limit from 10
global.Error.stackTraceLimit = 100;

const mountedContainers = new Set<HTMLDivElement>();
let unhookXcss: (() => void) | undefined;

function mockInnerText() {
  Object.defineProperty(global.window.HTMLElement.prototype, 'innerText', {
    // TODO: If we rely on innerText in any tests (editor tests?), improve this
    // because the current implementation will not return \n etc.
    get(this: HTMLElement) {
      const el = this.cloneNode(true) as HTMLElement;
      for (const s of el.querySelectorAll('script,style')) s.remove();
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
  if (typeof unhookXcss === 'function') {
    throw new TypeError(
      '.xcss hook already exists, did you forget to run teardown()?',
    );
  }

  // Make imported .xcss files return empty to prevent test errors (unit tests
  // can't assert styles properly anyway; better to create e2e tests!)
  unhookXcss = addHook(() => '', {
    exts: ['.xcss'],
  });

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
  if (typeof unhookXcss !== 'function') {
    throw new TypeError(
      '.xcss hook does not exist, did you forget to run setup()?',
    );
  }

  // https://github.com/jsdom/jsdom#closing-down-a-jsdom
  global.window.close();
  // @ts-expect-error - cleaning up
  // eslint-disable-next-line no-multi-assign
  global.window = global.document = undefined;

  unhookXcss();
  unhookXcss = undefined;
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
      // eslint-disable-next-line no-console
      console.log('DEBUG:');
      // eslint-disable-next-line no-console
      console.log(el.innerHTML);
    },
    // unmount() {
    //   container.removeChild(component);
    // },
  };
}

export function cleanup(): void {
  if (!mountedContainers || mountedContainers.size === 0) {
    throw new Error(
      'No mounted components exist, did you forget to call render()?',
    );
  }

  for (const container of mountedContainers) {
    if (container.parentNode === document.body) {
      container.remove();
    }

    mountedContainers.delete(container);
  }
}

export function mocksSetup(): void {
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

  // Stub only; create e2e tests for actual use cases
  global.window.Element.prototype.scrollTo = () => {};
}

export function mocksTeardown(): void {}
