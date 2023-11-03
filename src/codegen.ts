#! /usr/bin/env node

import { globSync } from 'fast-glob';
import * as fs from 'fs';
import * as path from 'path';
import { generateSqlFnFromSql } from './generateSqlFnFromSql';

const rootPath: string = process.argv[2];
const ojotasConfig = JSON.parse(fs.readFileSync('.ojotasrc.json').toString());

const files = globSync(path.join(rootPath, '/**/*.sql'));

files.forEach((file) => {
  const sql = fs.readFileSync(file, 'utf8').replace(/\n/g, '');
  const basename = path.basename(file, '.sql');
  const result = generateSqlFnFromSql(ojotasConfig, basename, sql);
  const outputPath = path.join(path.dirname(file), basename + '.sql.ts');
  fs.writeFileSync(outputPath, result);
});
