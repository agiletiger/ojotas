import { getReturnColumns } from './getReturnColumns';
import { Relations } from './assemble';
import { getReturnTypeName } from './getReturnTypeName';
import fs from 'node:fs';
import { AST, aliasify } from './parser';
import { getQueryParams } from './getQueryParams';
import path from 'node:path';
import { getParamsTypeName } from './getParamsTypeName';
import { getIdentifiers } from './getIdentifiers';
import { Dialect } from './orm';
import { ModelTypes } from './mapSqlTypeToTsType';

export const generateSqlDescriptor = (
  rootPath: string, // I'm passing this so same function can work with local tests and inside node_modules. Not sure this is the right way..
  modelTypes: ModelTypes,
  ojotasConfig: {
    aliases: Record<string, string>;
    relations: Relations;
    dialect: Dialect;
  },
  queryName: string,
  ast: AST,
) => {
  const queryWithoutParams = fs
    .readFileSync(path.join(rootPath, '../templates/query-without-params.ts'))
    .toString();
  const queryWithParams = fs
    .readFileSync(path.join(rootPath, '../templates/query-with-params.ts'))
    .toString();

  const returnColumns = getReturnColumns(modelTypes, ast);
  // TODO: refactor. getParamsFromAst is also called in codegen
  const queryParams = getQueryParams(modelTypes, ast);
  const identifiers = getIdentifiers(ojotasConfig.aliases, returnColumns);

  if (queryParams.length) {
    return queryWithParams
      .replace('$queryName$', queryName)
      .replace('$sql$', aliasify(ojotasConfig.dialect, ast))
      .replace('$identifiers$', JSON.stringify(identifiers))
      .replace('$paramsTypeName$', getParamsTypeName(queryName))
      .replace('$returnTypeName$', getReturnTypeName(queryName))
      .replace('// @ts-nocheck', '');
  } else {
    return queryWithoutParams
      .replace('$queryName$', queryName)
      .replace('$sql$', aliasify(ojotasConfig.dialect, ast))
      .replace('$identifiers$', JSON.stringify(identifiers))
      .replace('$returnTypeName$', getReturnTypeName(queryName))
      .replace('// @ts-nocheck', '');
  }
};
