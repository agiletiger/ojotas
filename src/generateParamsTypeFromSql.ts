import * as mysql from 'mysql2/promise';
import { AST, Parser } from 'node-sql-parser';
import { getTableDefinition } from './getTableDefinition';
import { mapColumnDefinitionToType } from './mapColumnDefinitionToType';
import { capitalize } from './utils/capitalize';

const OPTIONAL_PARAM_REGEXP = /:[A-Za-z_]+\?/g;

const getParamsTypeName = (queryName: string) =>
  `I${capitalize(queryName)}QueryParams`;

export const generateParamsTypeFromSql = async (
  connection: mysql.Connection,
  schema: string,
  queryName: string,
  sql: string,
) => {
  const parser = new Parser();

  // node-sql-parser does not like the syntax we use to define optional params :[A-Za-z_]? and it shouldn't need to support it
  // so we will pre process the sql string to account for that
  const optionalParams = (sql.match(OPTIONAL_PARAM_REGEXP) ?? [])
    // remove starting : and trailing ?
    .map((v: string) => v.slice(1, -1));
  const preprocessedSql = optionalParams.length
    ? // remove trialing ? to not break node-sql-parser
      sql.replace(OPTIONAL_PARAM_REGEXP, (v) => v.slice(0, -1))
    : sql;

  const ast = parser.astify(preprocessedSql) as AST;

  console.dir(ast, { depth: null });

  if (ast.type === 'select' && ast.where) {
    const paramHolder =
      ast.where.left.type === 'param'
        ? 'left'
        : ast.where.right.type === 'param'
        ? 'right'
        : null;

    const columnHolder =
      ast.where.left.type === 'column_ref'
        ? 'left'
        : ast.where.right.type === 'column_ref'
        ? 'right'
        : null;

    if (paramHolder && columnHolder) {
      const param = ast.where[paramHolder].value;
      const column = ast.where[columnHolder].column;
      const table =
        ast.where[columnHolder].table ??
        (ast.from.length === 1 ? ast.from[0].table : null);

      if (!table) {
        // MVP: if the query is valid we could go against the db and check to with table the column corresponds
        // but for now we will ask the user to set aliases when working with multiple tables in a single query
        throw new Error(
          `do not know to which table corresponds column ${column}. please specify aliases when working with multiple tables.`,
        );
      }

      const tableDefinition = await getTableDefinition(
        connection,
        schema,
        table,
      );

      const types = Object.entries(tableDefinition)
        .filter(([columnName]) => column === columnName)
        .map(
          ([, columnDefinition]) =>
            `${param}${
              optionalParams.includes(param) ? '?' : ''
            }: ${mapColumnDefinitionToType(columnDefinition)};`,
        )
        .join('\n');

      return `
        export interface ${getParamsTypeName(queryName)} {
          ${types}
        }
        `;
    }
  }

  return '';
};
