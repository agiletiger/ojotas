import { ColumnRef } from 'node-sql-parser';

declare module 'node-sql-parser' {
  interface Update {
    returning: {
      type: 'returning';
      columns: Array<{ type: 'expr'; expr: ColumnRef; as: string | null }>;
    };
  }
}
