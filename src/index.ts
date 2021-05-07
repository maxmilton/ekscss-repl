import { setupSyntheticEvent } from 'stage0/syntheticEvents';
import { Input } from './components/Input';
import { Nav } from './components/Nav';
import { Output } from './components/Output';
import { Footer } from './components/Footer';
import { Console } from './components/Console';
import { append, create } from './utils';
import './css/index.xcss';

declare global {
  interface HTMLElement {
    /** `stage0` synthetic click event handler. */
    __click(event: MouseEvent): void;
  }
}

setupSyntheticEvent('click');

const app = create('div');
app.id = 'app';

append(Nav(), app);
append(Input(), app);
append(Output(), app);
append(Console(), app);
append(Footer(), app);
append(app, document.body);
