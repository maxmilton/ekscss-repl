import { compile } from 'stage1/macro' assert { type: 'macro' };
import { h } from 'stage1/runtime';
import { interpolate } from '../macros' assert { type: 'macro' };

export type FooterComponent = HTMLElement;

// const meta = compile(`
//   <footer id=foot class="mv3 fss muted tc">
//     © <a href=https://maxmilton.com class="normal muted" rel=noreferrer>Max Milton</a> ・ <a href=https://github.com/maxmilton/ekscss rel=noreferrer>ekscss</a> v${process.env.EKSCSS_VERSION} ・ <a href=https://github.com/maxmilton/ekscss-repl rel=noreferrer>REPL</a> ${process.env.APP_RELEASE} ・ <a href=https://github.com/maxmilton/ekscss-repl/issues rel=noreferrer>report bug</a>
//   </footer>
// `);

const meta = compile(
  // FIXME: This is a convoluted workaround for a bug in the bun macro system,
  // where it crashes when doing string literal template interpolation.
  // https://github.com/oven-sh/bun/issues/3641
  interpolate(
    `
      <footer id=foot class="mv3 fss muted tc">
        © <a href=https://maxmilton.com class="normal muted" rel=noreferrer>Max Milton</a> ・ <a href=https://github.com/maxmilton/ekscss rel=noreferrer>ekscss</a> v%%1%% ・ <a href=https://github.com/maxmilton/ekscss-repl rel=noreferrer>REPL</a> %%2%% ・ <a href=https://github.com/maxmilton/ekscss-repl/issues rel=noreferrer>report bug</a>
      </footer>
    `,
    [process.env.EKSCSS_VERSION!, process.env.APP_RELEASE!],
  ),
);
const view = h<FooterComponent>(meta.html);

export function Footer(): FooterComponent {
  const root = view;
  return root;
}
