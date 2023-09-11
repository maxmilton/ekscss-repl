import { preloadApply } from '@ekscss/framework/utils';
import { onBeforeBuild } from 'ekscss';

// Generate references so #apply can be used in any file
onBeforeBuild(preloadApply);

// eslint-disable-next-line no-restricted-exports
export { default } from '@ekscss/framework/config';
