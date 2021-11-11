const DEFAULT_DEBOUNCE_DELAY_MS = 260;

/**
 * Delay running a function until X ms have passed since its last call.
 */
export function debounce<T extends (
  ...args: unknown[]) => unknown>(
  fn: T,
  delay = DEFAULT_DEBOUNCE_DELAY_MS,
): T {
  let timer: NodeJS.Timeout;

  // @ts-expect-error - Transparent wrapper will not change input function type
  // eslint-disable-next-line func-names
  return function (this: unknown, ...args) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, unicorn/no-this-assignment
    const context = this;

    clearTimeout(timer);

    timer = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
}
