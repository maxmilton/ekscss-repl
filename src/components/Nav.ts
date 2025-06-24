import './Nav.xcss';

import { collect, h, ONCLICK } from 'stage1';
import { compile } from 'stage1/macro' with { type: 'macro' };
import { globalRefs, run } from '../service.ts';

type NavComponent = HTMLDivElement;

interface Refs {
  auto: HTMLInputElement;
  compile: HTMLButtonElement;
  clear: HTMLButtonElement;
}

const meta = compile<Refs>(`
  <div id=nav class="dfc pv1 ph3">
    <h1 id=logo class=mv0>ekscss REPL</h1>

    <a href=https://ekscss.js.org class=pl4 target=_blank rel=noreferrer>Docs</a>

    <div class="df ml-auto">
      <input @auto id=auto type=checkbox class=checkbox checked>
      <label for=auto class=label>Auto compile on input</label>
    </div>

    <button @compile class="button button-primary mh3">Compile</button>
    <button @clear class=button>Clear Output</button>
  </div>
`);
const view = h<NavComponent>(meta.html);

export function Nav(): NavComponent {
  const root = view;
  const refs = collect<Refs>(root, meta.k, meta.d);

  globalRefs.auto = refs.auto;

  refs.compile[ONCLICK] = run;

  refs.clear[ONCLICK] = () => {
    globalRefs.output.setContent('');
    globalRefs.console.clear();
  };

  return root;
}
