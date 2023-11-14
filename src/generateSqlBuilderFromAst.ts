import { AST, sqlify } from './parser';

export const generateSqlBuilderFromAst = (ast: AST) => {
  return sqlify(ast);
};
