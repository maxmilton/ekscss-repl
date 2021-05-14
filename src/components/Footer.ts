import { h, S1Node } from 'stage1';

export type FooterComponent = S1Node & HTMLElement;

const view = h`
  <footer id=foot class="mv3 fss muted tc">
    © <a href=https://maxmilton.com class="normal muted" rel=noreferrer>Max Milton</a> | <a href=https://github.com/maxmilton/ekscss rel=noreferrer>ekscss</a> v${process.env.EKSCSS_VERSION} &middot; <a href=https://github.com/maxmilton/ekscss-repl rel=noreferrer>REPL</a>&nbsp;${process.env.APP_VERSION}
  </footer>
`;

export function Footer(): FooterComponent {
  const root = view as FooterComponent;
  return root;
}
