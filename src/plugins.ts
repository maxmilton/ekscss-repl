import { type Element, type Middleware, onAfterBuild } from "ekscss/dist/browser";

let ast: Element[];

onAfterBuild(() => {
  console.log("AST:", ast); // eslint-disable-line no-console
});

/**
 * XCSS plugin to extract the parsed AST.
 */
export const astPlugin: Middleware = (element, _index, children): void => {
  // Last root element children is the final AST
  if (element.root === null) {
    ast = children as Element[];
  }
};
