import { ColumnDefinition } from './mapColumnDefinitionToType';
import { Connection } from './orm';

export interface TableDefinition {
  [columnName: string]: ColumnDefinition;
}

const getEnumNameFromColumn = (dataType: string, columnName: string): string =>
  `${dataType}_${columnName}`;

export const getTablesDefinition = async (
  connection: Connection,
  tableNames: string[],
): Promise<Record<string, TableDefinition>> => {
  const tableDefinitions: Record<string, TableDefinition> = {};

  const columnsInfoSql = await connection.query(connection.columnsInfoSql, {
    tableNames: [tableNames],
  });

  columnsInfoSql.forEach((row) => {
    const tableName = row.table as string;
    const columnName = row.column as string;
    const dataType = row.type as string;
    const isNullable = row.nullable as string;

    if (!tableDefinitions[tableName]) {
      tableDefinitions[tableName] = {};
    }

    tableDefinitions[tableName][columnName] = {
      udtName: /^(enum|set)$/i.test(dataType)
        ? getEnumNameFromColumn(dataType, columnName)
        : dataType,
      nullable: isNullable === 'YES',
    };
  });

  return tableDefinitions;
};
