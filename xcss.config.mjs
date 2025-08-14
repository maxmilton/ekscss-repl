import { preloadApply } from "@ekscss/framework/utils";
import { onBeforeBuild } from "ekscss";

// Generate references so #apply can be used in any file
onBeforeBuild(preloadApply);

export { default } from "@ekscss/framework/config"; // eslint-disable-line no-restricted-exports
