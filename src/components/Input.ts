import { h, S1Node } from 'stage1';
import { refs, run } from '../service';
import { append, debounce } from '../utils';
import { Editor } from './Editor';

type InputComponent = S1Node & HTMLDivElement;

const view = h`
  <div id=in>
    <h2>Source Code</h2>
  </div>
`;

export function Input(): InputComponent {
  const root = view as InputComponent;
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
    if (refs.auto.checked) run();
  });

  append((refs.input = editor), root);

  return root;
}
