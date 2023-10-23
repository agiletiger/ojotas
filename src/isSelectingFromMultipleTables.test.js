import { describe, it } from 'node:test';
// eslint-disable-next-line import/no-extraneous-dependencies
import fc from 'fast-check';

import { isSelectingFromMultipleTables } from './isSelectingFromMultipleTables.js';

describe('isSelectingFromMultipleTables', () => {
  it('should return false when selecting from a single table', () => {
    fc.assert(
      fc.property(
        fc.mixedCase(fc.constant('select')),
        fc.oneof(
          fc.constant(['*']),
          fc.constant(['a.*']),
          fc.array(
            fc.stringOf(fc.constantFrom('a', 'b', 'c', 'd'), { minLength: 1 }),
            { minLength: 1 },
          ),
        ),
        fc.mixedCase(fc.constant('from')),
        fc.string({ minLength: 1 }),
        (select, columns, from, rest) => {
          return (
            isSelectingFromMultipleTables(
              `${select} ${columns.join(', ')} ${from} ${rest}`,
            ) === false
          );
        },
      ),
    );
  });

  it('should return true when selecting from a multiple tables', () => {
    fc.assert(
      fc.property(
        fc.mixedCase(fc.constant('select')),
        fc.oneof(
          fc.constant(['a.*', 'b.*']),
          fc.constantFrom('a', 'b', 'c', 'd').chain((tableAlias) =>
            fc.array(
              fc.stringOf(
                fc
                  .constantFrom('a', 'b', 'c', 'd')
                  .map((columnName) => `${tableAlias}.${columnName}`),
                {
                  minLength: 1,
                },
              ),
              { minLength: 2 },
            ),
          ),
        ),
        fc.mixedCase(fc.constant('from')),
        fc.string({ minLength: 1 }),
        (select, columns, from, rest) => {
          return (
            isSelectingFromMultipleTables(
              `${select} ${columns.join(', ')} ${from} ${rest}`,
            ) === true
          );
        },
      ),
    );
  });
});
