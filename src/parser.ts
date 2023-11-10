import { AST as NodeAST, Parser } from 'node-sql-parser';

const OPTIONAL_PARAM_REGEXP = /:[A-Za-z_]+\?/g;

export type AST = NodeAST & {
  optionalParams: string[];
};

const parser = new Parser();

export const astify = (sql: string): AST => {
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

  ast.optionalParams = optionalParams;

  return ast;
};

export const sqlify = (ast: AST) => parser.sqlify(ast);

export const aliasify = (ast: AST) => {
  //https://github.com/taozhi8833998/node-sql-parser/issues/1638
  if (ast.type === 'select' && ast.columns !== '*') {
    ast.columns = ast.columns.map(({ expr }) => ({
      expr,
      as: expr.column !== '*' ? `${expr.table}.${expr.column}` : null,
    }));
  }

  return sqlify(ast);
};
