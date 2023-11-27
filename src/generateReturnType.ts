import { ReturnColumns } from './getReturnColumns';
import { Relations } from './assemble';
import { getReturnTypeName } from './getReturnTypeName';

export const generateReturnType = (
  relations: Relations,
  queryName: string,
  selectedColumns: ReturnColumns,
) => {
  const tableTypes: { table: string; types: string }[] = [];

  for (const [table, columns] of Object.entries(selectedColumns)) {
    const types = columns
      .map(
        (column) =>
          `${column.name}${column.nullable ? '?' : ''}: ${column.type};`,
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
