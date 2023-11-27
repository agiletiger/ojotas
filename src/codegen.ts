import 'dotenv/config';

import { globSync } from 'fast-glob';
import fs from 'fs';
import path from 'path';

import { generateSqlDescriptor } from './generateSqlDescriptor';
import { generateReturnType } from './generateReturnType';
import { astify } from './parser';
import { generateQueryParamsType } from './generateQueryParamsType';
import { getSchemaTypes } from './getSchemaTypes';
import { getConnection } from './getConnection';
import { getQueryParams } from './getQueryParams';
import { getReturnColumns } from './getReturnColumns';

export const codegen = async (nodeModulePath: string, rootPath: string) => {
  const ojotasConfig = JSON.parse(fs.readFileSync('.ojotasrc.json').toString());

  const files = globSync(path.join(rootPath, '/**/*.sql'));

  const connection = await getConnection(ojotasConfig.dialect);

  const readFiles = files.map((file) => {
    const sql = fs.readFileSync(file, 'utf8').replace(/\n/g, '');
    const basename = path.basename(file, '.sql');
    const ast = astify(ojotasConfig.dialect, sql);
    return { file, basename, ast };
  });

  const visitedTables = [
    ...new Set(
      readFiles
        .flatMap(({ ast }) =>
          ast.type === 'select'
            ? ast.from
            : ast.type === 'insert'
            ? ast.table
            : [],
        )
        .map((f) => f.table),
    ),
  ];

  const schemaTypes = await getSchemaTypes(connection, visitedTables);

  // this happens when you don't have lenses
  const modelTypes = Object.fromEntries(
    Object.entries(schemaTypes).map(([tableName, columns]) => {
      return [
        tableName,
        Object.fromEntries(
          Object.entries(columns).map(([columnName, { type, nullable }]) => [
            columnName,
            {
              type: connection.mapMySqlTypeToTsType(type),
              nullable,
            },
          ]),
        ),
      ];
    }),
  );

  for (const { file, basename, ast } of readFiles) {
    const generatedSqlFile = generateSqlDescriptor(
      nodeModulePath,
      modelTypes,
      ojotasConfig,
      basename,
      ast,
    );

    const paramsType = generateQueryParamsType(
      basename,
      getQueryParams(modelTypes, ast),
    );
    const returnType = generateReturnType(
      ojotasConfig.relations,
      basename,
      getReturnColumns(modelTypes, ast),
    );
    const outputPath = path.join(path.dirname(file), basename + '.sql.ts');
    fs.writeFileSync(
      outputPath,
      generatedSqlFile
        .replace('$paramsTypePlaceholder$', paramsType)
        .replace('$returnTypePlaceholder$', returnType),
    );
  }

  connection.destroy();
};
