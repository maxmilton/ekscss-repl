import h, { HNode } from 'stage0';
import './Editor.xcss';

export interface EditorComponent extends HNode<HTMLDivElement> {
  setContent(code: string): void;
  getContent(): string;
}

const view = h`
  <ol contenteditable=true class="editor textarea w100 code" rows=10 spellcheck=false></ol>
`;

export function Editor(): EditorComponent {
  const root = view.cloneNode(true) as EditorComponent;

  document.execCommand('defaultParagraphSeparator', false, 'li');

  // convert rich content to plain text
  root.onpaste = (event) => {
    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  root.setContent = (code) => {
    // TODO: Using innerHTML whichcould be a security issue; consider a
    // refactor to use innerText and DOM methods
    root.innerHTML = code
      .split('\n')
      .map((line) => `<li>${line}</li>`)
      .join('');
  };

  root.getContent = () => root.innerText;

  return root;
}
