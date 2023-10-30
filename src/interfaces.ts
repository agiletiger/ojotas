export interface ColumnDefinition {
  udtName: string;
  nullable: boolean;
  tsType?: string;
}

export interface TableDefinition {
  [columnName: string]: ColumnDefinition;
}
