import { ColumnRef } from 'node-sql-parser';

// https://github.com/taozhi8833998/node-sql-parser/issues/1678
interface Returning {
  type: 'returning';
  columns: Array<{ type: 'expr'; expr: ColumnRef; as: string | null }>;
}

declare module 'node-sql-parser' {
  interface Update {
    returning: Returning;
  }
  interface Insert_Replace {
    returning: Returning;
  }
}
