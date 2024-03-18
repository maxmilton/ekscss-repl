declare let setTimeout: typeof window.setTimeout;
declare let clearTimeout: typeof window.clearTimeout;

const DEFAULT_DEBOUNCE_DELAY_MS = 260;

/**
 * Delay running a function until X ms have passed since its last call.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay = DEFAULT_DEBOUNCE_DELAY_MS,
): (...args: Parameters<T>) => void {
  let timer: number | undefined;

  // eslint-disable-next-line func-names
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, unicorn/no-this-assignment
    const context = this;

    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
}
