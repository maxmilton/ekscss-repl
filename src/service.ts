import { compile, XCSSCompileResult } from 'ekscss';
import type { ConsoleComponent } from './components/Console';
import type { EditorComponent } from './components/Editor';

interface Refs {
  // src/components/Nav.ts
  auto: HTMLInputElement;
  // src/components/Input.ts
  input: EditorComponent;
  // src/components/Output.ts
  output: EditorComponent;
  // src/components/Console.ts
  console: ConsoleComponent;
}

// @ts-expect-error - Entries set at runtime
export const refs: Refs = {};

export function run(): void {
  const src = refs.input.getContent();
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
    refs.console.log(`Compile time: ${(t1 - t0).toFixed(2)}ms`);
  } catch (err) {
    refs.console.error(err);
    refs.output.setContent('');
    return;
  }

  for (const warning of compiled.warnings) {
    refs.console.warn(`Warning: ${warning.message || warning}`);

    if (warning.file) {
      refs.console.log(
        `  at ${[warning.file, warning.line, warning.column]
          .filter(Boolean)
          .join(':')}`,
      );
    }
  }

  if (!compiled.css) {
    refs.console.warn('Compile result empty');
    refs.output.setContent('');
  } else {
    // highlight potential code issues
    const cssHighlighted = compiled.css.replace(
      /null|undefined|UNDEFINED|INVALID|NaN|#apply:/g,
      '<strong class=red3>$&</strong>',
    );

    // TODO: Editor#setContent uses set innerHTML which could be a security
    // issue; consider a refactor to use innerText and DOM methods
    refs.output.setContent(cssHighlighted);
  }
}
