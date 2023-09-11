import './Editor.xcss';

import { compile } from 'stage1/macro' assert { type: 'macro' };
import { clone, h } from 'stage1/runtime';

export type EditorComponent = HTMLOListElement & {
  /** `autofocus` global attribute for `contenteditable` element. */
  autofocus?: boolean;
  setContent(code: string): void;
  getContent(): string;
};

const meta = compile(`
  <ol
    contenteditable=true
    class="editor w100 mt0 code"
    rows=10
    spellcheck=false
  ></ol>
`);
const view = h<EditorComponent>(meta.html);

export function Editor(): EditorComponent {
  const root = clone(view);

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
