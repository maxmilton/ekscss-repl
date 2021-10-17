/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-var-requires */

// @ts-expect-error - no types yet
const { preloadApply } = require('@ekscss/framework/utils');
const { onBeforeBuild } = require('ekscss');

// generate references so #apply can be used in any file
onBeforeBuild(preloadApply);

// @ts-expect-error - no types yet
module.exports = require('@ekscss/framework/config');
