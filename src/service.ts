import { compile, XCSSCompileResult } from 'ekscss';
import type { ConsoleComponent } from './components/Console';
import type { EditorComponent } from './components/Editor';
import { astPlugin } from './plugins';

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
      //  ↳ Maybe use a tab based UI, with the first tab being "Options" which
      //    include plugins, globals, etc. and the other tabs being input files
      globals: {},
      // TODO: Allow adding plugins via config... at least allow enabling the
      // availiable "official" plugins
      //  ↳ Toggleable plugins might be a nice way to disable the AST plugin
      //  ↳ v1 of this cvould be just the toggable official plugins and a future
      //    v2 could be user loadable plugins via a CDN URL
      // TODO: AST plugin should be disabled by default + include a note to see
      // the output in the browser devtools console
      plugins: [astPlugin],
    });

    const t1 = performance.now();
    refs.console.log(`Compile time: ${(t1 - t0).toFixed(2)}ms`);
  } catch (error) {
    refs.console.error(error);
    refs.output.setContent('');
    return;
  }

  for (const warning of compiled.warnings) {
    refs.console.warn(`Warning: ${(warning.message || warning).toString()}`);

    if (warning.file) {
      refs.console.log(
        `  at ${[warning.file, warning.line, warning.column]
          .filter(Boolean)
          .join(':')}`,
      );
    }
  }

  if (compiled.css) {
    // highlight potential code issues
    const cssHighlighted = compiled.css.replace(
      /null|undefined|UNDEFINED|INVALID|NaN|#apply:/g,
      '<strong class=red3>$&</strong>',
    );

    // TODO: Editor#setContent uses set innerHTML which could be a security
    // issue; consider a refactor to use innerText and DOM methods
    refs.output.setContent(cssHighlighted);
  } else {
    refs.console.warn('Compile result empty');
    refs.output.setContent('');
  }
}
