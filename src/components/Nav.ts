import h, { HNode } from 'stage0';
import { refs, run } from '../service';
import './Nav.xcss';

type NavComponent = HNode<HTMLDivElement>;

interface RefNodes {
  auto: HTMLInputElement;
  compile: HTMLButtonElement;
  clear: HTMLButtonElement;
}

const view = h`
  <div id=nav class="dfc pv1 ph3">
    <h1 id=logo class=mv0>ekscss REPL</h1>

    <a href=https://maxmilton.github.io/ekscss class=pl4 target=_blank rel=noreferrer>Open ekscss docs</a>

    <label for=auto class="auto label ml-auto mb0 mr3">
      <input id=auto type=checkbox class="checkbox mr2" checked #auto />
      Auto compile on input
    </label>
    <button class="button button-primary mr3" #compile>Compile</button>
    <button class=button #clear>Clear Output</button>
  </div>
`;

export function Nav(): NavComponent {
  const root = view as NavComponent;
  const { auto, compile, clear } = view.collect(root) as RefNodes;

  refs.auto = auto;

  compile.__click = run;

  clear.__click = () => {
    refs.output.setContent('');
    refs.console.clear();
  };

  return root;
}
