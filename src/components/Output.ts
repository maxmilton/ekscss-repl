import { append, h } from 'stage1';
import { compile } from 'stage1/macro' assert { type: 'macro' };
import { globalRefs } from '../service';
import { Editor } from './Editor';

type OutputComponent = HTMLDivElement;

const meta = compile(`
  <div id=out>
    <h2>Build Result</h2>
  </div>
`);
const view = h<OutputComponent>(meta.html);

export function Output(): OutputComponent {
  const root = view;
  const editor = Editor();

  editor.contentEditable = 'false';
  editor.className = `${editor.className} editor-wrap`;
  editor.title = 'read only';

  append((globalRefs.output = editor), root);

  return root;
}
