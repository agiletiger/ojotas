/**
 * Type definition for named placeholders.
 */
declare module 'named-placeholders' {
  function createCompiler(
    config?: unknown,
  ): (query: string, paramsObj: Record<string, unknown>) => [string, string[]];
  export = createCompiler;
}
