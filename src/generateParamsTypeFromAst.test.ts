import { describe, it } from 'node:test';
import assert from 'node:assert';

import { generateParamsTypeFromAst } from './generateParamsTypeFromAst';
import { astify } from './parser';
import { TableDefinition } from './getTablesDefinition';
import { mapMySqlColumnDefinitionToType } from './mapColumnDefinitionToType';

const assertEqualIgnoreWhiteSpaces = (actual: string, expected: string) =>
  assert.equal(actual.replace(/\s+/g, ' '), expected.replace(/\s+/g, ' '));

describe('generateParamsTypeFromAst', () => {
  const tableDefinitions: Record<string, TableDefinition> = {
    users: {
      id: { udtName: 'int', nullable: false },
      name: { udtName: 'varchar', nullable: false },
    },
  };
  it('should be no type if no params', () => {
    const queryName = 'selectAllUsers';
    const paramsType = generateParamsTypeFromAst(
      mapMySqlColumnDefinitionToType,
      tableDefinitions,
      queryName,
      astify('select id, name from users'),
    );

    assertEqualIgnoreWhiteSpaces(paramsType, ``);
  });

  it('should create a mandatory string type when having a param in where statement', () => {
    const queryName = 'selectUsersFilteredByName';
    const paramsType = generateParamsTypeFromAst(
      mapMySqlColumnDefinitionToType,
      tableDefinitions,
      queryName,
      astify('select id, name from users where name like :name'),
    );

    assertEqualIgnoreWhiteSpaces(
      paramsType,
      `
      export type SelectUsersFilteredByNameQueryParams = {
        name: string;
      };
      `,
    );
  });

  it('should create an optional string type when having an optional param in where statement', () => {
    const queryName = 'selectUsersFilteredByName';
    const paramsType = generateParamsTypeFromAst(
      mapMySqlColumnDefinitionToType,
      tableDefinitions,
      queryName,
      astify('select id, name from users where name like :name?'),
    );

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
