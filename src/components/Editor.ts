import h, { HNode } from 'stage0';
import './Editor.xcss';

interface EditorComponent extends HNode<HTMLDivElement> {
  setContent(code: string): void;
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
    root.innerHTML = code
      .split('\n')
      .map((line) => `<li>${line}</li>`)
      .join('');
  };

  return root;
}
