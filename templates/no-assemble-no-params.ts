// @ts-nocheck
import { Connection } from 'ojotas';

$returnTypePlaceholder$

export const $queryName$ = async (connection: Connection) => {
  const sql = '$sql$';
  try {
    const [rows] = await connection.execute(sql);

    return rows as $returnTypeName$[];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error executing query: ${sql}`, error);
    throw error;
  }
};
