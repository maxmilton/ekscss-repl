import { h, setupSyntheticEvent } from 'stage1';
import { Console } from './components/Console';
import { Footer } from './components/Footer';
import { Input } from './components/Input';
import { Nav } from './components/Nav';
import { Output } from './components/Output';
import './css/index.xcss';
import { run } from './service';
import { append, create } from './utils';

declare global {
  interface HTMLElement {
    /** `stage1` synthetic click event handler. */
    __click(event: MouseEvent): void;
  }
}

setupSyntheticEvent('click');

// TODO: Remove temporary warning (and its associated styles)
append(
  h`
  <div id=warn>
    <strong>Warning:</strong> This REPL app is a <abbr title="Work In Progress">WIP</abbr>, please <a href=https://github.com/maxmilton/ekscss-repl/issues rel=noreferrer>report issues</a>!
  </div>
`,
  document.body,
);

const app = create('div');
app.id = 'app';

append(Nav(), app);
append(Input(), app);
append(Output(), app);
append(Console(), app);
append(Footer(), app);
append(app, document.body);

// Run initial compile
run();
