import { describe, it } from 'node:test';
import assert from 'node:assert';

import { generateQueryParamsType } from './generateQueryParamsType';

const assertEqualIgnoreWhiteSpaces = (actual: string, expected: string) =>
  assert.equal(actual.replace(/\s+/g, ' '), expected.replace(/\s+/g, ' '));

describe('generateQueryParamsType', () => {
  it('should be no type if no params', () => {
    const queryName = 'selectAllUsers';
    const paramsType = generateQueryParamsType(queryName, []);

    assertEqualIgnoreWhiteSpaces(paramsType, ``);
  });

  it('should create a mandatory string type', () => {
    const queryName = 'selectUsersFilteredByName';
    const paramsType = generateQueryParamsType(queryName, [
      {
        name: 'name',
        column: 'name',
        optional: false,
        table: 'users',
        type: 'string',
      },
    ]);

    assertEqualIgnoreWhiteSpaces(
      paramsType,
      `
      export type SelectUsersFilteredByNameQueryParams = {
        name: string;
      };
      `,
    );
  });

  it('should create an optional string type', () => {
    const queryName = 'selectUsersFilteredByName';
    const paramsType = generateQueryParamsType(queryName, [
      {
        name: 'name',
        column: 'name',
        optional: true,
        table: 'users',
        type: 'string',
      },
    ]);

    assertEqualIgnoreWhiteSpaces(
      paramsType,
      `
      export type SelectUsersFilteredByNameQueryParams = {
        name?: string;
      };
      `,
    );
  });
});
