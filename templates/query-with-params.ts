// @ts-nocheck
$paramsTypePlaceholder$

$returnTypePlaceholder$

export const $queryName$ = (params: $paramsTypeName$) => {
  return () => {
    return {
      sql: '$sql$',
      params: params,
      identifiers: $identifiers$,
      cast: (rows: unknown) => {
        return rows as $returnTypeName$[];
      } 
    }
  }
};
