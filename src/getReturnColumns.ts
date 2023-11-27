import { Column, ColumnRef, From } from 'node-sql-parser';
import { AST } from './parser';
import { ModelName, ModelTypes, TsType } from './mapSqlTypeToTsType';

export type ReturnColumns = Record<
  ModelName,
  Array<{
    name: string;
    type: TsType;
    nullable: boolean;
  }>
>;

export const getReturnColumns = (
  modelTypes: ModelTypes,
  ast: AST,
): ReturnColumns => {
  //https://github.com/taozhi8833998/node-sql-parser/issues/1638
  if (ast.type === 'select' && ast.columns !== '*') {
    const from = ast.from as Array<From>;
    return (ast.columns as Column[]).reduce((acc, curr) => {
      const columnRef = curr.expr as ColumnRef;
      const tableRef = columnRef.table;
      const tableName = from.find((f) => f.as === tableRef).table;
      const columnName = columnRef.column;
      const type = Object.entries(modelTypes[tableName]).find(
        ([cn]) => cn === columnName,
      )[1];
      acc[tableName] ??= [];
      acc[tableName].push({
        name: columnName,
        type: type.type,
        nullable: type.nullable,
      });
      return acc;
    }, {});
  }

  if ((ast.type === 'update' || ast.type === 'insert') && ast.returning) {
    const from = (ast.table[0] as From).table;
    return {
      [from]: ast.returning.columns.map((c) => {
        const columnName = c.expr.column;
        const type = Object.entries(modelTypes[from]).find(
          ([cn]) => cn === columnName,
        )[1];
        return {
          name: columnName,
          type: type.type,
          nullable: type.nullable,
        };
      }),
    };
  }

  return {};
};
