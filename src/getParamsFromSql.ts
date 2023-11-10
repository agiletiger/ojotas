import { AST, ColumnRef, From, Parser } from 'node-sql-parser';

// types are not provided https://github.com/taozhi8833998/node-sql-parser/issues/1662
type Param = { type: 'param'; value: string };
type Expr =
  | {
      type: 'binary_expr';
      operator: 'AND' | 'OR';
      left: Expr;
      right: Expr;
    }
  | {
      type: 'binary_expr';
      operator: string;
      left: ColumnRef | Param;
      right: ColumnRef | Param;
    };

const OPTIONAL_PARAM_REGEXP = /:[A-Za-z_]+\?/g;

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
    const table =
      (expr[columnBranch] as ColumnRef).table ??
      (from.length === 1 ? from[0].table : null);

    return [{ name, column, table }];
  }

  return getParamsFromExpr(expr.left as Expr, from).concat(
    getParamsFromExpr(expr.right as Expr, from),
  );
};

export const getParamsFromSql = (
  sql: string,
): { name: string; optional: boolean; column: string; table: string }[] => {
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
      optional: optionalParams.includes(name),
    }));
  }

  return [];
};
