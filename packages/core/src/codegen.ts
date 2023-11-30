import 'dotenv/config';

import { globSync } from 'fast-glob';
import fs from 'fs';
import path from 'path';

import { generateSqlTsFile } from './generateSqlTsFile';
import { astify } from './parser';
import { getSchemaTypes } from './getSchemaTypes';
import { getConnection } from './getConnection';
import { Relations } from './assemble';
import { Dialect } from './orm';

export const codegen = async (
  nodeModulePath: string,
  ojotasConfig: {
    aliases: Record<string, string>;
    relations: Relations;
    dialect: Dialect;
  },
  sqlFilesRootPath: string,
) => {
  const files = globSync(path.join(sqlFilesRootPath, '/**/*.sql'));

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
    const generatedSqlFile = generateSqlTsFile(
      nodeModulePath,
      modelTypes,
      ojotasConfig,
      basename,
      ast,
    );

    const outputPath = path.join(path.dirname(file), basename + '.sql.ts');
    fs.writeFileSync(outputPath, generatedSqlFile);
  }

  await connection.destroy();
};
