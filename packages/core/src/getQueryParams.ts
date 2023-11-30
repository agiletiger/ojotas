import { ColumnRef, Expr, From, Param } from 'node-sql-parser';
import { AST } from './parser';
import { ModelTypes, TsType } from './mapSqlTypeToTsType';

const getParamBranch = (expr: Expr) =>
  expr.left.type === 'param'
    ? 'left'
    : expr.right.type === 'param'
    ? 'right'
    : null;

const getColumnBranch = (expr: Expr) =>
  expr.left.type === 'column_ref'
    ? 'left'
    : expr.right.type === 'column_ref'
    ? 'right'
    : null;

const getParamsFromExpr = (
  expr: Expr,
  from: From[],
): { name: string; column: string; table: string }[] => {
  if (expr.operator !== 'AND' && expr.operator !== 'OR') {
    const paramBranch = getParamBranch(expr);
    const columnBranch = getColumnBranch(expr);

    const name = (expr[paramBranch] as Param).value;
    const column = (expr[columnBranch] as ColumnRef).column;
    const as = (expr[columnBranch] as ColumnRef).table;
    const table =
      from.length === 1
        ? from[0].table
        : as
        ? from.find((f) => f.as === as).table
        : null;

    return [{ name, column, table }];
  }

  return getParamsFromExpr(expr.left as Expr, from).concat(
    getParamsFromExpr(expr.right as Expr, from),
  );
};

export type QueryParam = {
  name: string;
  optional: boolean;
  type: TsType;
  column: string;
  table: string;
};

export const getQueryParams = (
  modelTypes: ModelTypes,
  ast: AST,
): QueryParam[] => {
  if (ast.type === 'select' && ast.where) {
    const whereParams = getParamsFromExpr(ast.where, ast.from);

    const columnWithNoTable = whereParams.find((p) => !p.table);

    if (columnWithNoTable) {
      // MVP: if the query is valid we could go against the db and check to with table the column corresponds
      // but for now we will ask the user to set aliases when working with multiple tables in a single query
      throw new Error(
        `do not know to which table corresponds column ${columnWithNoTable.column}. please specify aliases when working with multiple tables.`,
      );
    }

    return whereParams.map(({ name, column, table }) => ({
      name,
      column,
      table,
      optional: ast.optionalParams.includes(name),
      type: modelTypes[table][column].type,
    }));
  }

  if (ast.type === 'insert') {
    const table = ast.table[0].table;
    const params = ast.values[0].value;

    return ast.columns.map((column, index) => ({
      table,
      column,
      optional: false,
      name: params[index].type === 'param' ? params[index].value : column,
      type: modelTypes[table][column]?.type,
    }));
  }
  return [];
};
