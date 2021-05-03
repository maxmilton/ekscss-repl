import h, { HNode } from 'stage0';
import { refs } from '../service';
import { append } from '../utils';
import { Console } from './Console';
import { Editor } from './Editor';

type OutputComponent = HNode<HTMLDivElement>;

interface RefNodes {
  result: HTMLDivElement;
  console: HTMLDivElement;
}

const view = h`
  <div id=output>
    <div #result>
      <h2>Build Result <small>(read only)</small></h2>
    </div>
    <div #console>
      <h2>Console Output</h2>
    </div>
  </div>
`;

export function Output(): OutputComponent {
  const root = view as OutputComponent;
  const { result, console } = view.collect(root) as RefNodes;
  const editor = Editor();

  editor.contentEditable = 'false';
  editor.className = `${editor.className} editor-wrap`;

  append((refs.output = editor), result);
  append((refs.console = Console()), console);

  return root;
}
