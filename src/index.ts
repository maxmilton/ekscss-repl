import "./css/index.xcss";

import { append, create, h, setupSyntheticClick } from "stage1/fast";
import { compile } from "stage1/macro" with { type: "macro" };
import { Console } from "./components/Console.ts";
import { Footer } from "./components/Footer.ts";
import { Input } from "./components/Input.ts";
import { Nav } from "./components/Nav.ts";
import { Output } from "./components/Output.ts";
import { run } from "./service.ts";

setupSyntheticClick();

// TODO: Remove temporary warning (and its associated styles)
append(
  h(
    compile(
      `
        <div id=alert>
          <strong>Warning:</strong> This REPL app is a <abbr title="Work In Progress">WIP</abbr>, please <a href=https://github.com/maxmilton/ekscss-repl/issues rel=noreferrer>report issues</a>!
        </div>
      `,
      { keepSpaces: true },
    ).html,
  ),
  document.body,
);

const app = create("div");
app.id = "app";

append(Nav(), app);
append(Input(), app);
append(Output(), app);
append(Console(), app);
append(Footer(), app);
append(app, document.body);

// Run initial XCSS compile
run();
