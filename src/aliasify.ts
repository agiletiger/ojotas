import { AST, Parser } from 'node-sql-parser';

export const aliasify = (sql: string) => {
  const parser = new Parser();

  const ast = parser.astify(sql) as AST;

  //https://github.com/taozhi8833998/node-sql-parser/issues/1638
  if (ast.type === 'select' && ast.columns !== '*') {
    ast.columns = ast.columns.map(({ expr }) => ({
      expr,
      as: expr.column !== '*' ? `${expr.table}.${expr.column}` : null,
    }));
    return parser.sqlify(ast);
  }

  return sql;
};
