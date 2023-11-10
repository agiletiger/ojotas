import * as mysql from 'mysql2/promise';

import { getTableDefinition } from './getTableDefinition';
import { mapColumnDefinitionToType } from './mapColumnDefinitionToType';
import { capitalize } from './utils/capitalize';
import { getParamsFromAst } from './getParamsFromAst';
import { AST } from './parser';

const getParamsTypeName = (queryName: string) =>
  `I${capitalize(queryName)}QueryParams`;

export const generateParamsTypeFromAst = async (
  connection: mysql.Connection,
  schema: string,
  queryName: string,
  ast: AST,
) => {
  const params = getParamsFromAst(ast);

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
