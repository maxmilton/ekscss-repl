import "./Console.xcss";
import { append, collect, create, h } from "stage1/fast";
import { compile } from "stage1/macro" with { type: "macro" };
import { globalRefs } from "#/service.ts";

export type ConsoleComponent = HTMLDivElement & {
  log: (...args: readonly unknown[]) => void;
  warn: (...args: readonly unknown[]) => void;
  error: (...args: readonly unknown[]) => void;
  clear: () => void;
};

interface Refs {
  output: HTMLDivElement;
}

const meta = compile<Refs>(/*html*/ `
  <div id=con>
    <h2>Console Output</h2>
    <div @output class="console code-block code"></div>
  </div>
`);
const view = h<ConsoleComponent>(meta.html);

export function Console(): ConsoleComponent {
  const root = view;
  const refs = collect(root, meta.d);
  const output = refs[meta.ref.output];

  const print =
    (method: "log" | "warn" | "error", color?: string) =>
    (...args: readonly unknown[]) => {
      const line = create("div");
      if (color) line.className = color;
      line.textContent = args.toString();
      append(line, output);
      output.scrollTo(0, output.scrollHeight);

      console[method](...args);
    };

  root.log = print("log");
  root.warn = print("warn", "gold4");
  root.error = print("error", "red5");

  root.clear = () => {
    output.textContent = "";
  };

  // append(output, root);
  globalRefs.console = root;

  return root;
}
