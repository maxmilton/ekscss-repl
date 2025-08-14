import type { meta, send } from "bugbox";
import type { ONCLICK } from "stage1/fast";

declare module "bun" {
  interface Env {
    readonly APP_RELEASE: string;
    readonly EKSCSS_VERSION: string;
  }
}

declare global {
  interface HTMLElement {
    /** `stage1` synthetic click event handler. */
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    [ONCLICK]?(event: Event): false | void | Promise<void>;
  }

  interface Window {
    /** Injected by BugBox CDN script in HTML. */
    readonly bugbox?: {
      readonly meta: typeof meta;
      readonly send: typeof send;
    };
  }

  // eslint-disable-next-line vars-on-top
  var bugbox: Window["bugbox"];
}
