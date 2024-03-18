import {
  onAfterBuild,
  type Element,
  type Middleware,
} from 'ekscss/dist/browser';

let ast: Element[];

onAfterBuild(() => {
  // biome-ignore lint/suspicious/noConsoleLog: intentionally log the AST, even in production
  console.log('AST:', ast); // eslint-disable-line no-console
});

/**
 * XCSS plugin to extract the parsed AST.
 */
export const astPlugin: Middleware = (element, _index, children): void => {
  // last root element children is the final AST
  if (element.root === null) {
    ast = children as Element[];
  }
};
