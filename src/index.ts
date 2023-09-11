import './css/index.xcss';

import { compile } from 'stage1/macro' assert { type: 'macro' };
import { append, create, h, setupSyntheticEvent } from 'stage1/runtime';
import type * as trackx from 'trackx';
import { Console } from './components/Console';
import { Footer } from './components/Footer';
import { Input } from './components/Input';
import { Nav } from './components/Nav';
import { Output } from './components/Output';
import { run } from './service';

declare global {
  interface HTMLElement {
    /** `stage1` synthetic click event handler. */
    __click?(event: MouseEvent): void | Promise<void>;
  }

  interface Window {
    // Added by trackx CDN script in index.html
    trackx?: typeof trackx;
  }
}

if (window.trackx) {
  window.trackx.meta.release = process.env.APP_RELEASE;
  window.trackx.meta.ekscss = process.env.EKSCSS_VERSION;

  if (process.env.NODE_ENV !== 'production') {
    window.trackx.meta.NODE_ENV = process.env.NODE_ENV ?? 'NULL';
  }
}

setupSyntheticEvent('click');

// TODO: Remove temporary warning (and its associated styles)
append(
  h(
    compile(`
      <div id=alert>
        <strong>Warning:</strong> This REPL app is <abbr title="Work In Progress">WIP</abbr>, please <a href=https://github.com/maxmilton/ekscss-repl/issues rel=noreferrer>report issues</a>!
      </div>
  `).html,
  ),
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

// Run initial XCSS compile
run();
