import {
  Connection,
  MySqlConnectionConfig,
  PostgreSqlConnectionConfig,
  createMySqlConnection,
  createPostgreSqlConnection,
} from './orm';

export const getConnection = async (
  dialect: 'mysql' | 'postgres' | undefined,
): Promise<Connection> => {
  if (dialect === 'mysql') {
    const config: MySqlConnectionConfig = {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };
    return createMySqlConnection(config);
  } else if (dialect === 'postgres') {
    const config: PostgreSqlConnectionConfig = {
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT),
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
    };
    return createPostgreSqlConnection(config);
  } else {
    throw new Error(`Dialect: ${dialect} not supported.`);
  }
};
