import h, { HNode } from 'stage0';
import { refs, run } from '../service';
import { append, debounce } from '../utils';
import { Editor } from './Editor';

type InputComponent = HNode<HTMLDivElement>;

const view = h`
  <div id=input>
    <h2>Input Source</h2>
  </div>
`;

export function Input(): InputComponent {
  const root = view as InputComponent;
  const editor = Editor();
  editor.autofocus = true;
  /* minify-templates-ignore */
  editor.setContent(`/**
* Sample XCSS Code
* Try modify this code to see the build result live!
*/

// the "default" function sets values if they're not already defined
\${x.fn.default({
  color: {
    blue: 'deepskyblue',
    red: 'coral',
  },
})}

body {
  font-size: 20px;
  color: \${x.color.red};
}

// the "entries" function works the same as Object.entries but also joins the
// callback result, also note the use of "xcss" template tag which must
// explicitly be used when returning a template literal
\${x.fn.entries(x.color, ([key, value]) => xcss\`
  .\${key} { color: \${value}; }
\`)}
`);

  editor.oninput = debounce(() => {
    if (refs.auto.checked) run();
  });

  refs.input = editor;
  append(editor, root);

  // Run compile on init but after mounting the component
  setTimeout(run, 0);

  return root;
}
