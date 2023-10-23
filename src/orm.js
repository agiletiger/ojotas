import fs from 'node:fs';
import assemble from './assemble.js';
import { isSelectingFromMultipleTables } from './isSelectingFromMultipleTables.js';

const ojotasConfig = JSON.parse(fs.readFileSync('.ojotasrc.json').toString());

export const query = async (connection, sql, identifiers) => {
  try {
    const [rows] = await connection.execute(sql);
    if (isSelectingFromMultipleTables(sql)) {
      return assemble(
        ojotasConfig.relations,
        ojotasConfig.aliases,
        identifiers,
        rows,
      );
    }

    return rows;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error executing query: ${sql}`, error);
    throw error;
  }
};
