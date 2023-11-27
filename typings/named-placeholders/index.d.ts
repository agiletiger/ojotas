/**
 * Type definition for named placeholders.
 */
declare module 'named-placeholders' {
  export const toNumbered: (
    query: string,
    paramsObj: Record<string, unknown>,
  ) => [string, string[]];
  function createCompiler(
    config?: unknown,
  ): (query: string, paramsObj: Record<string, unknown>) => [string, string[]];
  export default createCompiler;
}
