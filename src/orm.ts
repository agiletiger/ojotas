import * as fs from 'node:fs';

import { assemble } from './assemble';
import { Connection, SqlFn } from './types';

export { Connection, SqlFn };

export type QueryFn = <T>(
  connection: Connection,
  executor: SqlFn<T>,
) => Promise<T[]>;

const ojotasConfig = JSON.parse(fs.readFileSync('.ojotasrc.json').toString());
export const query: QueryFn = async (connection, executor) =>
  executor(connection, assemble, ojotasConfig);
