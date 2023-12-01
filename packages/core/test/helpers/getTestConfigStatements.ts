import { readFileSync } from 'fs';

export const getTestConfigStatements = () => {
  const dialect = process.env.DIALECT as 'mysql' | 'postgres' | undefined;
  let file: Buffer;
  if (dialect === 'mysql') {
    file = readFileSync('./test/config/my.sql');
  } else if (dialect === 'postgres') {
    file = readFileSync('./test/config/pg.sql');
  } else {
    throw new Error(`Dialect: ${dialect} not supported.`);
  }

  return file.toString().split(';').slice(0, -1); // last statement is always empty bc of split
};
