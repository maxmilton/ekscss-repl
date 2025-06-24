// HACK: Workaround for bun not handling package.json "exports" correctly.
declare module 'ekscss/dist/browser' {
  export * from 'ekscss';
}

declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.xcss' {
  const content: string;
  export default content;
}
