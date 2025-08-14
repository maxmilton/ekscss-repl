// FIXME: Uncomment this file once bun macro issues are fixed:
//  ↳ https://github.com/oven-sh/bun/issues/3641
//  ↳ https://github.com/oven-sh/bun/issues/3832

$console.warn("Not implemented");

// import { cleanup, render } from "@maxmilton/test-utils/dom";
// import { afterEach, expect, test } from "bun:test";
// import { Footer } from "../../src/components/Footer.ts";

// afterEach(cleanup);

// test("rendered DOM contains expected elements", () => {
//   expect.assertions(4);
//   const rendered = render(Footer());
//   expect(rendered.container.firstChild?.nodeName).toBe("FOOTER");
//   expect(rendered.container.querySelector('a[href="https://maxmilton.com"]')).toBeTruthy();
//   expect(
//     rendered.container.querySelector('a[href="https://github.com/maxmilton/ekscss"]'),
//   ).toBeTruthy();
//   expect(
//     rendered.container.querySelector('a[href="https://github.com/maxmilton/ekscss-repl/issues"]'),
//   ).toBeTruthy();

//   // TODO: More/better assertions
// });

// test("rendered DOM matches snapshot", () => {
//   expect.assertions(1);
//   const rendered = render(Footer());
//   expect(rendered.container.innerHTML).toMatchSnapshot();
// });

// test("contains the app release version number", () => {
//   expect.assertions(1);
//   const rendered = render(Footer());
//   expect(rendered.container.innerHTML).toMatch(/v\d+\.\d+\.\d+/);
// });
