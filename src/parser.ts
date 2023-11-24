import { AST as NodeAST, Parser } from 'node-sql-parser';
import { Dialect } from './orm';

const OPTIONAL_PARAM_REGEXP = /:[A-Za-z_]+\?/g;
const DIALECT_MAP: Record<Dialect, string> = {
  mysql: 'MySQL',
  postgres: 'Postgresql',
};

export type AST = NodeAST & {
  optionalParams: string[];
};

const parser = new Parser();

export const astify = (dialect: Dialect, sql: string): AST => {
  // node-sql-parser does not like the syntax we use to define optional params :[A-Za-z_]? and it shouldn't need to support it
  // so we will pre process the sql string to account for that
  const optionalParams = (sql.match(OPTIONAL_PARAM_REGEXP) ?? [])
    // remove starting : and trailing ?
    .map((v: string) => v.slice(1, -1));
  const preprocessedSql = optionalParams.length
    ? // remove trialing ? to not break node-sql-parser
      sql.replace(OPTIONAL_PARAM_REGEXP, (v) => v.slice(0, -1))
    : sql;

  let ast = parser.astify(preprocessedSql, {
    database: DIALECT_MAP[dialect],
  }) as AST;

  // https://github.com/taozhi8833998/node-sql-parser/issues/1677
  ast = Array.isArray(ast) ? ast[0] : ast;

  ast.optionalParams = optionalParams;

  return ast;
};

export const sqlify = (dialect: Dialect, ast: AST) =>
  parser.sqlify(ast, { database: DIALECT_MAP[dialect] });

export const aliasify = (dialect: Dialect, ast: AST) => {
  //https://github.com/taozhi8833998/node-sql-parser/issues/1638
  if (ast.type === 'select' && ast.columns !== '*' && ast.from?.length > 1) {
    ast.columns = ast.columns.map(({ expr }) => ({
      expr,
      as: expr.column !== '*' ? `${expr.table}.${expr.column}` : null,
    }));
  }

  return sqlify(dialect, ast);
};
