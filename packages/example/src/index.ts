import 'dotenv/config';

import { selectAllUsers } from './selectAllUsers.sql';
import {
  MySqlConnectionConfig,
  // PostgreSqlConnectionConfig,
  createMySqlConnection,
  // createPostgreSqlConnection,
  query,
} from '../../core/';
import { insertUser } from './insertUser.sql';

const main = async () => {
  // pick the database you want to test
  const mysqlConfig: MySqlConnectionConfig = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };

  // const postgreConfig: PostgreSqlConnectionConfig = {
  //   host: process.env.PGHOST,
  //   port: Number(process.env.PGPORT),
  //   user: process.env.PGUSER,
  //   password: process.env.PGPASSWORD,
  //   database: process.env.PGDATABASE,
  // };

  const mysqlConnection = await createMySqlConnection(mysqlConfig);
  // const postgresConnection = await createPostgreSqlConnection(postgreConfig);

  const users = await query(mysqlConnection, selectAllUsers);

  console.dir({ users });

  await query(mysqlConnection, insertUser({ name: 'eze' }));

  await mysqlConnection.destroy();
};

(async () => {
  await main();
})();
