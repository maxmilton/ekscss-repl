// HACK: Workaround for bun not handling package.json "exports" correctly.
declare module 'ekscss/dist/browser' {
  // biome-ignore lint/performance/noReExportAll: types only
  export * from 'ekscss';
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.xcss' {
  const content: string;
  export default content;
}
