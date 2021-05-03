import h, { HNode } from 'stage0';

export type FooterComponent = HNode<HTMLElement>;

// FIXME: stage0 seems to be removing the spaces; PR fix or create a fork
const view = h`
  <footer class="mv3 fss muted tc">
    ©&nbsp;<a href=https://maxmilton.com class="normal muted" target=_blank rel=noreferrer>Max Milton</a>&nbsp;| ekscss v${process.env.EKSCSS_VERSION} &middot; REPL ${process.env.APP_VERSION}
  </footer>
`;

export function Footer(): FooterComponent {
  const root = view;

  return root;
}
