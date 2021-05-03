import { create } from '../utils';
import './Console.xcss';

export interface ConsoleComponent extends HTMLDivElement {
  clearSelf(): void;
}

const view = create('div');
view.id = 'console';
view.className = 'code-block code';

export function Console(): ConsoleComponent {
  const root = view as ConsoleComponent;

  root.clearSelf = () => {
    root.innerText = '';
  };

  return root;
}
