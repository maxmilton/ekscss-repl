/* eslint-disable @typescript-eslint/no-var-requires */

const { preloadApply } = require('@ekscss/framework/utils');
const { onBeforeBuild } = require('ekscss');

// Generate references so #apply can be used in any file
onBeforeBuild(preloadApply);

module.exports = require('@ekscss/framework/config');
