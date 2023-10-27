import * as mysql from 'mysql2/promise';
import { TableDefinition } from './interfaces';

const getEnumNameFromColumn = (dataType: string, columnName: string): string =>
  `${dataType}_${columnName}`;

export const getTableDefinition = async (
  connection: mysql.Connection,
  tableSchema: string,
  tableName: string,
) => {
  const tableDefinition: TableDefinition = {};

  const [tableColumns] = await connection.query<mysql.RowDataPacket[]>(
    'SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = ? and table_schema = ?',
    [tableName, tableSchema],
  );
  tableColumns.map((schemaItem) => {
    const columnName = schemaItem.COLUMN_NAME;
    const dataType = schemaItem.DATA_TYPE;
    tableDefinition[columnName] = {
      udtName: /^(enum|set)$/i.test(dataType)
        ? getEnumNameFromColumn(dataType, columnName)
        : dataType,
      nullable: schemaItem.IS_NULLABLE === 'YES',
    };
  });
  return tableDefinition;
};
