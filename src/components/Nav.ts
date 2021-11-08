import { h, S1Node } from 'stage1';
import { refs, run } from '../service';
import './Nav.xcss';

type NavComponent = S1Node & HTMLDivElement;

type RefNodes = {
  auto: HTMLInputElement;
  compile: HTMLButtonElement;
  clear: HTMLButtonElement;
};

const view = h`
  <div id=nav class="dfc pv1 ph3">
    <h1 id=logo class=mv0>ekscss REPL</h1>

    <a href=https://ekscss.js.org class=pl4 target=_blank rel=noreferrer>Docs</a>

    <div class="df ml-auto">
      <input id=auto type=checkbox class=checkbox checked #auto>
      <label for=auto class=label>Auto compile on input</label>
    </div>

    <button class="button button-primary mh3" #compile>Compile</button>
    <button class=button #clear>Clear Output</button>
  </div>
`;

export function Nav(): NavComponent {
  const root = view as NavComponent;
  const { auto, compile, clear } = view.collect<RefNodes>(root);

  refs.auto = auto;

  compile.__click = run;

  clear.__click = () => {
    refs.output.setContent('');
    refs.console.clear();
  };

  return root;
}
