import { append, h } from 'stage1';
import { compile } from 'stage1/macro' with { type: 'macro' };
import { globalRefs, run } from '../service.ts';
import { debounce } from '../utils.ts';
import { Editor } from './Editor.ts';

type InputComponent = HTMLDivElement;

const meta = compile(`
  <div id=in>
    <h2>Source Code</h2>
  </div>
`);
const view = h<InputComponent>(meta.html);

export function Input(): InputComponent {
  const root = view;
  const editor = Editor();
  editor.autofocus = true;
  editor.setContent(`/**
* Sample XCSS Styles
* Try modify this code to see the build result live!
*/

\${x.color = {
  red: 'coral',
  green: 'seagreen',
  blue: 'deepskyblue',
}, null}

body {
  font-size: 20px;
  color: \${x.color.red};
}

\${x.fn.each(x.color, (name, value) => xcss\`
  .\${name} { color: \${value}; }
\`)}
`);

  editor.oninput = debounce(() => {
    if (globalRefs.auto.checked) run();
  });

  append((globalRefs.input = editor), root);

  return root;
}
