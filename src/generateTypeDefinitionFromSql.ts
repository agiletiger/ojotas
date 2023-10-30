import * as mysql from 'mysql2/promise';

import { getSelectedColumns } from './getSelectedColumns';
import { mapColumnDefinitionToType } from './mapColumnDefinitionToType';
import { getTableDefinition } from './getTableDefinition';
import { Relations } from './assemble';

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const generateTypeDefinitionFromSql = async (
  relations: Relations,
  connection: mysql.Connection,
  schema: string,
  queryName: string,
  sql: string,
) => {
  const tableTypes: { table: string; types: string }[] = [];

  const selectedColumns = getSelectedColumns(sql);
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

  const capitalizedQueryName = capitalize(queryName);

  // MVP: we are only checking if there is a relation to the immediate previous table
  // TODO: check against all previous seen tables
  return `
    export interface I${capitalizedQueryName}QueryResultItem {
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
