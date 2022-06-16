import { Element, Middleware, onAfterBuild } from 'ekscss';

let ast: Element[];

onAfterBuild(() => {
  // eslint-disable-next-line no-console
  console.log('AST:', ast);
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
