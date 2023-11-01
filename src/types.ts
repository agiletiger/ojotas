import { AssembleFn, Relations } from './assemble';
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
