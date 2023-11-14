// @ts-nocheck
import { Connection } from 'ojotas';

$returnTypePlaceholder$

export const selectAllUsers = async (connection: Connection) => {
  const sql = 'SELECT `id`, `name` FROM `users`';
  try {
    const [rows] = await connection.execute(sql);

    return rows as ISelectAllUsersQueryResultItem[];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error executing query: ${sql}`, error);
    throw error;
  }
};
