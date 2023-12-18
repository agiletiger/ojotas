// @ts-nocheck
import { NonEmptyArray, PossiblyEmptyArray } from 'ojotas';

$returnTypePlaceholder$

export const $queryName$ = () => {
  return {
    sql: '$sql$',
    params: null,
    identifiers: $identifiers$,
    cast: (rows: unknown) => {
      return rows as $returnTypeName$[];
    } 
  }
};
