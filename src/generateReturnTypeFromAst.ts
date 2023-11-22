import { getSelectedColumnsFromAst } from './getSelectedColumnsFromAst';
import { mapMySqlColumnDefinitionToType } from './mapColumnDefinitionToType';
import { TableDefinition } from './getTablesDefinition';
import { Relations } from './assemble';
import { getReturnTypeName } from './getReturnTypeName';
import { AST } from './parser';

export const generateReturnTypeFromAst = (
  tableDefinitions: Record<string, TableDefinition>,
  relations: Relations,
  queryName: string,
  ast: AST,
) => {
  const tableTypes: { table: string; types: string }[] = [];

  const selectedColumns = getSelectedColumnsFromAst(ast);
  for (const [table, columns] of Object.entries(selectedColumns)) {
    const types = Object.entries(tableDefinitions[table])
      .filter(([columnName]) => columns.includes(columnName))
      .map(
        ([columnName, columnDefinition]) =>
          `${columnName}: ${mapMySqlColumnDefinitionToType(columnDefinition)};`,
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
