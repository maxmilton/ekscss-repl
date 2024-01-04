/* eslint-disable @typescript-eslint/no-explicit-any */

import './Console.xcss';

import { append, collect, create, h } from 'stage1';
import { compile } from 'stage1/macro' assert { type: 'macro' };
import { globalRefs } from '../service';

export type ConsoleComponent = HTMLDivElement & {
  log(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  clear(): void;
};

type Refs = {
  o: HTMLDivElement;
};

const meta = compile(`
  <div id=con>
    <h2>Console Output</h2>
    <div @o class="console code-block code"></div>
  </div>
`);
const view = h<ConsoleComponent>(meta.html);

type ConsoleMethodName = 'log' | 'warn' | 'error';

export function Console(): ConsoleComponent {
  const root = view;
  const refs = collect<Refs>(root, meta.k, meta.d);
  const output = refs.o;

  const print =
    (method: ConsoleMethodName, color = '') =>
    (...args: unknown[]) => {
      const line = create('div');
      line.className = color;
      line.textContent = args.toString();
      append(line, output);
      output.scrollTo(0, output.scrollHeight);

      // eslint-disable-next-line no-console
      console[method](...args);
    };

  root.log = print('log');
  root.warn = print('warn', 'gold4');
  root.error = print('error', 'red5');

  root.clear = () => {
    output.textContent = '';
  };

  // append(output, root);
  globalRefs.console = root;

  return root;
}
