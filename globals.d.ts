import type { meta, send } from "bugbox";
import type { ONCLICK } from "stage1/fast";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly CI?: string;
      readonly APP_RELEASE: string;
      readonly EKSCSS_VERSION: string;
    }
  }

  interface HTMLElement {
    /** `stage1` synthetic click event handler. */
    // oxlint-disable-next-line typescript/no-invalid-void-type typescript/prefer-readonly-parameter-types
    [ONCLICK]?: (event: Event) => false | void | Promise<void>;
  }

  interface Window {
    /** Injected by BugBox CDN script in HTML. */
    readonly bugbox?: {
      readonly meta: typeof meta;
      readonly send: typeof send;
    };
  }

  var bugbox: Window["bugbox"];
}
