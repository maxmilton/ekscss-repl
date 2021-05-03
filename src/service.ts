import { compile, XCSSCompileResult } from 'ekscss';
import { append, create } from './utils';

export const refs: Record<string, HTMLElement> = {};

function print(args: any[], color = ''): void {
  const line = create('div');
  line.className = color;
  line.innerText = args.toString();
  append(line, refs.console);
  refs.console.scrollTo(0, refs.console.scrollHeight);
}

export const log = (...args: any[]): void => {
  print(args);
  // eslint-disable-next-line no-console
  console.log(...args);
};
export const warn = (...args: any[]): void => {
  print(args, 'gold4');
  // eslint-disable-next-line no-console
  console.warn(...args);
};
export const error = (...args: any[]): void => {
  print(args, 'red5');
  // eslint-disable-next-line no-console
  console.error(...args);
};

export function run(): void {
  const src = refs.input.innerText.replace(/&nbsp;/g, ' ');
  let compiled: XCSSCompileResult;

  try {
    const t0 = performance.now();

    compiled = compile(src, {
      rootDir: '.',
      from: 'input.xcss',
      to: '',
      map: false,
      // TODO: Allow setting globals via a config
      globals: {},
      // TODO: Use plugin to get AST (so it doesn't need to be publicly exposed in ekscss)
      plugins: [],
    });

    const t1 = performance.now();
    log(`Compile time: ${(t1 - t0).toFixed(2)}ms`);
  } catch (err) {
    error(err);
    return;
  }

  for (const warning of compiled.warnings) {
    warn(`Warning: ${(warning.message || warning).toString()}`);

    if (warning.file) {
      log(
        `  at ${[warning.file, warning.line, warning.column]
          .filter(Boolean)
          .join(':')}`,
      );
    }
  }

  // FIXME: Show warning on empty output

  // highlight potential code issues
  const cssHighlighted = compiled.css.replace(
    /null|undefined|UNDEFINED|INVALID|NaN|#apply:/g,
    '<strong class=red3>$&</strong>',
  );

  // FIXME: Can the same thing be accomplished with `innerText`?
  // refs.output.innerText = cssHighlighted;
  // refs.output.innerHTML = cssHighlighted;
  refs.output.setContent(cssHighlighted);
}
