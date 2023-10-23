import mysql from 'mysql2/promise';
import fs from 'node:fs';
import assemble from './assemble.js';

const ojotasConfig = JSON.parse(fs.readFileSync('.ojotasrc.json').toString());

export const simpleQuery = async (sql, connection) => {
  try {
    const [rows, _] = await connection.execute(sql);
    return rows;
  } catch (error) {
    console.error(`Error executing query: ${sql}`, error);
    throw error;
  }
}

export const complexQuery = async (sql, connection) => {
  try {
    const [rows, _] = await connection.execute(sql);
    return assemble(ojotasConfig.relations, ojotasConfig.aliases, ['u.name', 'p.title'], rows);
  } catch (error) {
    console.error(`Error executing query: ${sql}`, error);
    throw error;
  }
}
