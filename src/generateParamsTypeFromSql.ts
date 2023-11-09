import * as mysql from 'mysql2/promise';

import { getTableDefinition } from './getTableDefinition';
import { mapColumnDefinitionToType } from './mapColumnDefinitionToType';
import { capitalize } from './utils/capitalize';
import { getParamsFromSql } from './getParamsFromSql';

const getParamsTypeName = (queryName: string) =>
  `I${capitalize(queryName)}QueryParams`;

export const generateParamsTypeFromSql = async (
  connection: mysql.Connection,
  schema: string,
  queryName: string,
  sql: string,
) => {
  const params = getParamsFromSql(sql);

  const tables = [...new Set(params.map((p) => p.table))];

  const mappedParams: string[] = [];

  for await (const table of tables) {
    const tableDefinition = await getTableDefinition(connection, schema, table);

    for (const param of params.filter((p) => p.table === table)) {
      const columnDefinition = Object.entries(tableDefinition).find(
        ([columnName]) => columnName === param.column,
      )[1];
      mappedParams.push(
        `${param.name}${param.optional ? '?' : ''}: ${mapColumnDefinitionToType(
          columnDefinition,
        )};`,
      );
    }
  }

  if (mappedParams.length) {
    return `
      export interface ${getParamsTypeName(queryName)} {
        ${mappedParams.join('\n')}
      }
      `;
  }

  return '';
};
