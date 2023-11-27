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

  // types are not provided https://github.com/taozhi8833998/node-sql-parser/issues/1662
  type Param = { type: 'param'; value: string };
  type Expr =
    | {
        type: 'binary_expr';
        operator: 'AND' | 'OR';
        left: Expr;
        right: Expr;
      }
    | {
        type: 'binary_expr';
        operator: string;
        left: ColumnRef | Param;
        right: ColumnRef | Param;
      };
}
