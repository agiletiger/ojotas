import * as mysql from 'mysql2/promise';

import { getSelectedColumnsFromAst } from './getSelectedColumnsFromAst';
import { mapColumnDefinitionToType } from './mapColumnDefinitionToType';
import { getTableDefinition } from './getTableDefinition';
import { Relations } from './assemble';
import { getReturnTypeName } from './getReturnTypeName';
import { AST } from './parser';

export const generateReturnTypeFromAst = async (
  relations: Relations,
  connection: mysql.Connection,
  schema: string,
  queryName: string,
  ast: AST,
) => {
  const tableTypes: { table: string; types: string }[] = [];

  const selectedColumns = getSelectedColumnsFromAst(ast);
  for await (const [table, columns] of Object.entries(selectedColumns)) {
    const tableDefinition = await getTableDefinition(connection, schema, table);

    const types = Object.entries(tableDefinition)
      .filter(([columnName]) => columns.includes(columnName))
      .map(
        ([columnName, columnDefinition]) =>
          `${columnName}: ${mapColumnDefinitionToType(columnDefinition)};`,
      )
      .join('\n');

    tableTypes.push({ table, types });
  }

  // MVP: we are only checking if there is a relation to the immediate previous table
  // TODO: check against all previous seen tables
  return `
    export interface ${getReturnTypeName(queryName)} {
      ${tableTypes
        .map(({ table, types }, index, array) => {
          if (index === 0) {
            return types;
          } else {
            const relation = relations[array[index - 1].table][table];
            if (relation?.[0] === 'hasMany') {
              return `${relation[1]}: Array<{\n${types}\n}>;`;
            }
          }
        })
        .join('\n')}
    }
    `;
};
