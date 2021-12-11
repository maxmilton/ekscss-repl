import { append, html, S1Node } from 'stage1';
import { refs } from '../service';
import { Editor } from './Editor';

type OutputComponent = S1Node & HTMLDivElement;

const view = html`
  <div id="out">
    <h2>Build Result</h2>
  </div>
`;

export function Output(): OutputComponent {
  const root = view as OutputComponent;
  const editor = Editor();

  editor.contentEditable = 'false';
  editor.className = `${editor.className} editor-wrap`;
  editor.title = 'read only';

  append((refs.output = editor), root);

  return root;
}
