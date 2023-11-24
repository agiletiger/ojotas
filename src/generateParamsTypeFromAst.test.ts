import { describe, it } from '../test/test-utils';
import assert from 'node:assert';

import { generateParamsTypeFromAst } from './generateParamsTypeFromAst';
import { astify } from './parser';
import { TableDefinition } from './getTablesDefinition';
import { mapMySqlColumnDefinitionToType } from './mapColumnDefinitionToType';
import { Dialect } from './orm';

const assertEqualIgnoreWhiteSpaces = (actual: string, expected: string) =>
  assert.equal(actual.replace(/\s+/g, ' '), expected.replace(/\s+/g, ' '));

describe('generateParamsTypeFromAst', () => {
  const tableDefinitions: Record<string, TableDefinition> = {
    users: {
      id: { udtName: 'int', nullable: false },
      name: { udtName: 'varchar', nullable: false },
    },
  };
  it.each([
    { dialect: 'mysql' as Dialect },
    { dialect: 'postgres' as Dialect },
  ])('$dialect - should be no type if no params', ({ dialect }) => {
    const queryName = 'selectAllUsers';
    const paramsType = generateParamsTypeFromAst(
      mapMySqlColumnDefinitionToType,
      tableDefinitions,
      queryName,
      astify(dialect, 'select id, name from users'),
    );

    assertEqualIgnoreWhiteSpaces(paramsType, ``);
  });

  it.each([
    { dialect: 'mysql' as Dialect },
    { dialect: 'postgres' as Dialect },
  ])(
    '$dialect - should create a mandatory string type when having a param in where statement',
    ({ dialect }) => {
      const queryName = 'selectUsersFilteredByName';
      const paramsType = generateParamsTypeFromAst(
        mapMySqlColumnDefinitionToType,
        tableDefinitions,
        queryName,
        astify(dialect, 'select id, name from users where name like :name'),
      );

      assertEqualIgnoreWhiteSpaces(
        paramsType,
        `
      export type SelectUsersFilteredByNameQueryParams = {
        name: string;
      };
      `,
      );
    },
  );

  it.each([
    { dialect: 'mysql' as Dialect },
    { dialect: 'postgres' as Dialect },
  ])(
    '$dialect - should create an optional string type when having an optional param in where statement',
    ({ dialect }) => {
      const queryName = 'selectUsersFilteredByName';
      const paramsType = generateParamsTypeFromAst(
        mapMySqlColumnDefinitionToType,
        tableDefinitions,
        queryName,
        astify(dialect, 'select id, name from users where name like :name?'),
      );

      assertEqualIgnoreWhiteSpaces(
        paramsType,
        `
      export type SelectUsersFilteredByNameQueryParams = {
        name?: string;
      };
      `,
      );
    },
  );
});
