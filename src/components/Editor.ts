import { h, S1Node } from 'stage1';
import './Editor.xcss';

export type EditorComponent = S1Node &
HTMLOListElement & {
  setContent(code: string): void;
  getContent(): string;
};

const view = h`
  <ol contenteditable=true class="editor textarea w100 mt0 code" rows=10 spellcheck=false></ol>
`;

export function Editor(): EditorComponent {
  const root = view.cloneNode(true) as EditorComponent;

  document.execCommand('defaultParagraphSeparator', false, 'li');

  // convert rich content to plain text when pasting
  root.onpaste = (event) => {
    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  root.setContent = (code) => {
    // TODO: Using innerHTML could be a security issue so consider a refactor
    // to use textContent/innerText and DOM methods
    root.innerHTML = code
      .split('\n')
      .map((line) => `<li>${line || '<br>'}</li>`)
      .join('');
  };

  // use innerText instead of textContent here so we also get \n etc.
  // eslint-disable-next-line unicorn/prefer-dom-node-text-content
  root.getContent = () => root.innerText;

  return root;
}
