import * as fs from 'node:fs';

import { assemble, AssembleFn, Relations } from './assemble';
import { Connection as MySqlConnection } from 'mysql2/promise';

export { AssembleFn } from './assemble';

export type Connection = MySqlConnection;

export type OjotasConfig = {
  relations: Relations;
  aliases: Record<string, string>;
};

export type SqlFn<T> = (
  connection: Connection,
  assemble: AssembleFn,
  ojotasConfig: OjotasConfig,
) => Promise<T[]>;

export type QueryFn = <T>(
  connection: Connection,
  executor: SqlFn<T>,
) => Promise<T[]>;

const ojotasConfig = JSON.parse(fs.readFileSync('.ojotasrc.json').toString());

export const query: QueryFn = async (connection, executor) =>
  executor(connection, assemble, ojotasConfig);
