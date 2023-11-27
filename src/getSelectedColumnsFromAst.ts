import { Column, ColumnRef, From } from 'node-sql-parser';
import { AST } from './parser';
import { MapSqlTypeToTsTypeFn, TsType } from './mapSqlTypeToTsType';

type TableName = string;
type ColumnName = string;

export type SchemaTypes = Record<
  TableName,
  Record<ColumnName, { tsType: TsType; nullable: boolean }>
>;

export const getSelectedColumnsFromAst = (
  types: SchemaTypes,
  ast: AST,
): Record<
  TableName,
  Array<{
    column: string;
    type: ReturnType<MapSqlTypeToTsTypeFn>;
    nullable: boolean;
  }>
> => {
  //https://github.com/taozhi8833998/node-sql-parser/issues/1638
  if (ast.type === 'select' && ast.columns !== '*') {
    const from = ast.from as Array<From>;
    return (ast.columns as Column[]).reduce((acc, curr) => {
      const columnRef = curr.expr as ColumnRef;
      const tableRef = columnRef.table;
      const tableName = from.find((f) => f.as === tableRef).table;
      const columnName = columnRef.column;
      const type = Object.entries(types[tableName]).find(
        ([cn]) => cn === columnName,
      )[1];
      acc[tableName] ??= [];
      acc[tableName].push({
        column: columnName,
        type: type.tsType,
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
        const type = Object.entries(types[from]).find(
          ([cn]) => cn === columnName,
        )[1];
        return {
          column: columnName,
          type: type.tsType,
          nullable: type.nullable,
        };
      }),
    };
  }

  return {};
};
