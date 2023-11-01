import * as fs from 'node:fs';

import { assemble } from './assemble';
import { Connection, SqlFn } from './types';

const ojotasConfig = JSON.parse(fs.readFileSync('.ojotasrc.json').toString());

export type QueryFn = <T>(
  connection: Connection,
  executor: SqlFn<T>,
) => Promise<T[]>;

export const query: QueryFn = async (connection, executor) =>
  executor(connection, assemble, ojotasConfig);
