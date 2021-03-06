import { html, S1Node } from 'stage1';

export type FooterComponent = S1Node & HTMLElement;

const view = html`
  <footer id=foot class="mv3 fss muted tc">
    © <a href=https://maxmilton.com class="normal muted" rel=noreferrer>Max Milton</a> ・ <a href=https://github.com/maxmilton/ekscss rel=noreferrer>ekscss</a> v${process.env.EKSCSS_VERSION} ・ <a href=https://github.com/maxmilton/ekscss-repl rel=noreferrer>REPL</a>&nbsp;${process.env.APP_RELEASE} ・ <a href=https://github.com/maxmilton/ekscss-repl/issues rel=noreferrer>report bug</a>
  </footer>
`;

export function Footer(): FooterComponent {
  const root = view as FooterComponent;
  return root;
}
