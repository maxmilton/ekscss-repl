// FIXME: This is a convoluted workaround for a bug in the bun macro system,
// where it crashes when doing string literal template interpolation.
// https://github.com/oven-sh/bun/issues/3641
export function interpolate(text: string, values: string[]): string {
  let result = text;

  // eslint-disable-next-line unicorn/no-array-for-each
  values.forEach((value, index) => {
    // eslint-disable-next-line security/detect-non-literal-regexp
    result = result.replace(new RegExp(`%%${String(index + 1)}%%`, 'g'), value);
  });

  return result;
}
