import {
  onAfterBuild,
  type Element,
  type Middleware,
} from 'ekscss/dist/browser';

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
