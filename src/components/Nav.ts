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
    <h1 id=logo class=mv0>
      <svg xmlns=http://www.w3.org/2000/svg viewBox="0 0 36 36" class="logo-icon di mr1">
        <path fill=#3b88c3 d="M36 32a4 4 0 01-4 4H4a4 4 0 01-4-4V4a4 4 0 014-4h28a4 4 0 014 4v28z"/>
        <path fill=#fff d="M30.2 10L23 4v4h-8C9.477 8 5 12.477 5 18c0 1.414.297 2.758.827 3.978l3.3-2.75A6 6 0 0115 12h8v4l7.2-6zm-.026 4.023l-3.301 2.75A6 6 0 0121 24h-8v-4l-7.2 6 7.2 6v-4h8c5.522 0 10-4.478 10-10a9.965 9.965 0 00-.826-3.977z"/>
      </svg>
      ekscss REPL
    </h1>

    <a href=https://maxmilton.github.io/ekscss class=pl4 target=_blank>View ekscss docs</a>
    <a href=https://github.com/MaxMilton/ekscss-repl class=pl4 title="ekscss REPL on GitHub">
      <svg xmlns=http://www.w3.org/2000/svg viewBox="0 0 36 36" class=github-icon>
        <path d="M17.998 0C8.058 0 0 8.059 0 18c0 7.953 5.157 14.7 12.31 17.08.9.165 1.228-.39 1.228-.868 0-.427-.015-1.56-.024-3.06-5.007 1.086-6.063-2.414-6.063-2.414-.819-2.079-2-2.632-2-2.632-1.633-1.118.125-1.095.125-1.095 1.806.128 2.757 1.855 2.757 1.855 1.605 2.75 4.213 1.956 5.238 1.496.164-1.164.628-1.957 1.143-2.407-3.997-.454-8.2-1.999-8.2-8.896 0-1.965.703-3.571 1.854-4.83-.186-.455-.803-2.285.176-4.764 0 0 1.511-.484 4.95 1.846A17.24 17.24 0 0118 8.705c1.528.007 3.069.207 4.506.606 3.437-2.33 4.945-1.846 4.945-1.846.983 2.479.365 4.309.18 4.764 1.153 1.259 1.85 2.865 1.85 4.83 0 6.915-4.209 8.437-8.219 8.882.647.556 1.222 1.654 1.222 3.334 0 2.405-.022 4.347-.022 4.937 0 .482.324 1.042 1.238.866C30.847 32.693 36 25.951 36 18 36 8.06 27.94 0 17.998 0" fill=#1b1817 fill-rule=evenodd />
      </svg>
    </a>

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
    // refs.input.innerText = '';
    // refs.ouput.innerText = '';
    // refs.console.innerText = '';

    // refs.input.innerText = refs.ouput.innerText = refs.console.innerText = '';
    // refs.ouput.innerText = refs.console.innerText = '';

    refs.ouput.innerText = '';
    refs.console.innerText = '';
  };

  return root;
}
