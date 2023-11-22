import { TableDefinition } from './getTablesDefinition';
import { mapMySqlColumnDefinitionToType } from './mapColumnDefinitionToType';
import { getParamsFromAst } from './getParamsFromAst';
import { AST } from './parser';
import { getParamsTypeName } from './getParamsTypeName';

export const generateParamsTypeFromAst = (
  tableDefinitions: Record<string, TableDefinition>,
  queryName: string,
  ast: AST,
) => {
  const params = getParamsFromAst(ast);

  const mappedParams: string[] = [];

  for (const param of params) {
    const columnDefinition = Object.entries(tableDefinitions[param.table]).find(
      ([columnName]) => columnName === param.column,
    )[1];
    mappedParams.push(
      `${param.name}${
        param.optional ? '?' : ''
      }: ${mapMySqlColumnDefinitionToType(columnDefinition)};`,
    );
  }

  if (mappedParams.length) {
    return `
      export type ${getParamsTypeName(queryName)} = {
        ${mappedParams.join('\n')}
      };
      `;
  }

  return '';
};
