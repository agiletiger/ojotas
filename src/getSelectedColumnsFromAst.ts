import { Column, ColumnRef, From } from 'node-sql-parser';
import { AST } from './parser';

export const getSelectedColumnsFromAst = (ast: AST) => {
  //https://github.com/taozhi8833998/node-sql-parser/issues/1638
  if (ast.type === 'select' && ast.columns !== '*') {
    const from = ast.from as Array<From>;
    return (ast.columns as Column[]).reduce(
      (acc, curr) => {
        const columnRef = curr.expr as ColumnRef;
        const tableRef = columnRef.table;
        const tableName = from.find((f) => f.as === tableRef).table;
        acc[tableName] ??= [];
        acc[tableName].push(columnRef.column);
        return acc;
      },
      {} as Record<string, string[]>,
    );
  }

  return {};
};
