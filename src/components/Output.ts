import h, { HNode } from 'stage0';
import { refs } from '../service';
import { append } from '../utils';
import { Editor } from './Editor';

type OutputComponent = HNode<HTMLDivElement>;

const view = h`
  <div id=out>
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
