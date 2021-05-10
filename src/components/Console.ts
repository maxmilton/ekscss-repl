import { h, S1Node } from 'stage1';
import { refs } from '../service';
import { append, create } from '../utils';
import './Console.xcss';

export type ConsoleComponent = S1Node &
HTMLDivElement & {
  log(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  clear(): void;
};

type RefNodes = {
  con: HTMLDivElement;
};

const view = h`
  <div id=con>
    <h2>Console Output</h2>
    <div #con class="console code-block code"></div>
  </div>
`;

type ConsoleMethodName = 'log' | 'warn' | 'error';

export function Console(): ConsoleComponent {
  const root = view as ConsoleComponent;
  const { con } = view.collect<RefNodes>(root);

  const print = (method: ConsoleMethodName, color = '') => (...args: any[]) => {
    const line = create('div');
    line.className = color;
    line.innerText = args.toString();
    append(line, con);
    con.scrollTo(0, con.scrollHeight);

    // eslint-disable-next-line no-console
    console[method](...args);
  };

  root.log = print('log');
  root.warn = print('warn', 'gold4');
  root.error = print('error', 'red5');

  root.clear = () => {
    con.innerText = '';
  };

  append(con, root);
  refs.console = root;

  return root;
}
