import { h, setupSyntheticEvent } from 'stage1';
import { Input } from './components/Input';
import { Nav } from './components/Nav';
import { Output } from './components/Output';
import { Footer } from './components/Footer';
import { Console } from './components/Console';
import { append, create } from './utils';
import './css/index.xcss';

declare global {
  interface HTMLElement {
    /** `stage1` synthetic click event handler. */
    __click(event: MouseEvent): void;
  }
}

setupSyntheticEvent('click');

// TODO: Remove temporary warning (and its assossiated styles)
append(
  h`
  <div id=alert>
    <strong>Warning:</strong> This REPL app is a <abbr title="Work In Progress">WIP</abbr>!
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
