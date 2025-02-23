// In production builds, index.css and index.js files are generated with a hash
// in the filename. So we need to find the actual filenames to test against.
export const distPath = `${import.meta.dir}/../../dist`;
export let indexCSS: string;
export let indexJS: string;

const indexFiles = new Bun.Glob('index*.{css,js}').scan({ cwd: distPath });
for await (const file of indexFiles) {
  if (file.endsWith('.css')) {
    indexCSS = file;
  } else if (file.endsWith('.js')) {
    indexJS = file;
  }
}
