import { setupSyntheticEvent } from 'stage0/syntheticEvents';
import { Input } from './components/Input';
import { Nav } from './components/Nav';
import { Output } from './components/Output';
import { Footer } from './components/Footer';
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
const main = create('main');
app.id = 'app';
main.className = 'grid l-x2 mh3';

append(Nav(), app);
append(Input(), main);
append(Output(), main);
append(main, app);
append(Footer(), app);
append(app, document.body);
