import { ColumnDefinition } from './interfaces';

export const mapColumnDefinitionToType = (column: ColumnDefinition) => {
  switch (column.udtName) {
    case 'char':
    case 'varchar':
    case 'text':
    case 'tinytext':
    case 'mediumtext':
    case 'longtext':
    case 'time':
    case 'geometry':
    case 'set':
    case 'enum':
      // keep set and enum defaulted to string if custom type not mapped
      return 'string';
    case 'integer':
    case 'int':
    case 'smallint':
    case 'mediumint':
    case 'bigint':
    case 'double':
    case 'decimal':
    case 'numeric':
    case 'float':
    case 'year':
      return 'number';
    case 'tinyint':
      return 'boolean';
      return column;
    case 'json':
      return 'Object';
    case 'date':
    case 'datetime':
    case 'timestamp':
      return 'Date';
    case 'tinyblob':
    case 'mediumblob':
    case 'longblob':
    case 'blob':
    case 'binary':
    case 'varbinary':
    case 'bit':
      return 'Buffer';
    default:
      return 'any';
  }
};
