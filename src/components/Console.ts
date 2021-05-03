import { refs } from '../service';
import { create } from '../utils';
import './Console.xcss';

type ConsoleComponent = HTMLDivElement;

const view = create('div');
view.id = 'console';
view.className = 'code-block code';

export function Console(): ConsoleComponent {
  const root = view;

  refs.console = root;

  return root;
}
