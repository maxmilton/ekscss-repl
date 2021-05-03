// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck 😢
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */

'use strict'; // eslint-disable-line

const framework = require('@ekscss/framework/xcss.config.js');
const merge = require('deepmerge');
// const { xcssTag } = require('ekscss');

// const xcss = xcssTag();

/** @type {(import('rollup-plugin-ekscss').XCSSConfig)} */
module.exports = merge(framework, {
  globals: {
    // fn: {},
    // media: {
    //   ns: '(min-width: 40.01rem)',
    //   m: '(min-width: 40.01rem) and (max-width: 70rem)',
    //   l: '(min-width: 70.01rem)',
    // },
    // containerWidthMax: '70rem',
    // textWeightLight: 300,
    // textWeight: 400,
    // textWeightHeavy: 700,
    app: {
      // shadow: (x) => xcss`0 0.1em 0.5em ${x.fn.color(x.color.dark2).alpha(0.7)}`,
      textWeightMedium: 500,
      textWeightHeavy: 800,
    },
  },
});
