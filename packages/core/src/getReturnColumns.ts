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

export type JoinMetadata = Record<
  ModelName,
  Record<ModelName, 'INNER JOIN' | 'LEFT JOIN'>
>;

export const getJoinMetadata = (ast: AST) => {
  if (ast.type === 'select') {
    if (ast.from.length === 1) {
      return {};
    }

    //POC: support only one join
    const fromJoin = ast.from.find((f) => !!f.join);
    if (fromJoin) {
      const leftAlias = fromJoin.on.left.table;
      const rightAlias = fromJoin.on.right.table;

      return {
        [ast.from.find((f) => f.as === leftAlias).table]: {
          [ast.from.find((f) => f.as === rightAlias).table]: fromJoin.join,
        },
      };
    }
  }

  return {};
};

export const getReturnColumns = (
  modelTypes: ModelTypes,
  ast: AST,
): { columns: ReturnColumns; joinMetadata?: JoinMetadata } => {
  //https://github.com/taozhi8833998/node-sql-parser/issues/1638
  if (ast.type === 'select' && ast.columns !== '*') {
    const from = ast.from as Array<From>;
    const returnColumns = (ast.columns as Column[]).reduce((acc, curr) => {
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

    return { columns: returnColumns, joinMetadata: getJoinMetadata(ast) };
  }

  if ((ast.type === 'update' || ast.type === 'insert') && ast.returning) {
    const from = (ast.table[0] as From).table;
    return {
      columns: {
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
      },
    };
  }

  return { columns: {} };
};
