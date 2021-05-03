// DOM
export const create = document.createElement.bind(document);
export const append = <T extends Node>(node: T, parent: Node): T => parent.appendChild(node);
// eslint-disable-next-line max-len
// export const prepend = <T extends Node>(node: T, parent: Node): T => parent.insertBefore(node, parent.firstChild);

const DEFAULT_DEBOUNCE_DELAY_MS = 260;

/**
 * Delay running a function until X ms have passed since its last call.
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay = DEFAULT_DEBOUNCE_DELAY_MS): T {
  let timer: NodeJS.Timeout;

  // @ts-expect-error - Transparent wraper will not change input function type
  return function (this: any, ...args) {
    // eslint-disable-next-line max-len
    // eslint-disable-next-line @typescript-eslint/no-this-alias, @typescript-eslint/no-unsafe-assignment
    const context = this;

    clearTimeout(timer);

    timer = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
}
