export interface ColumnDefinition {
  udtName: string;
  nullable: boolean;
}

export type mapColumnDefinitionToTypeFn = (
  column: ColumnDefinition,
) =>
  | 'string'
  | 'number'
  | 'boolean'
  | 'Object'
  | 'Date'
  | 'Buffer'
  | 'Array<number>'
  | 'Array<boolean>'
  | 'Array<string>'
  | 'Array<Object>'
  | 'Array<Date>'
  | 'any';

export const mapMySqlColumnDefinitionToType: mapColumnDefinitionToTypeFn = (
  column,
) => {
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

export const mapPostgreSqlColumnDefinitionToType: mapColumnDefinitionToTypeFn =
  (column) => {
    switch (column.udtName) {
      case 'bpchar':
      case 'char':
      case 'varchar':
      case 'text':
      case 'citext':
      case 'uuid':
      case 'bytea':
      case 'inet':
      case 'time':
      case 'timetz':
      case 'interval':
      case 'name':
        return 'string';
      case 'int2':
      case 'int4':
      case 'int8':
      case 'float4':
      case 'float8':
      case 'numeric':
      case 'money':
      case 'oid':
        return 'number';
      case 'bool':
        return 'boolean';
      case 'json':
      case 'jsonb':
        return 'Object';
      case 'date':
      case 'timestamp':
      case 'timestamptz':
        return 'Date';
      case '_int2':
      case '_int4':
      case '_int8':
      case '_float4':
      case '_float8':
      case '_numeric':
      case '_money':
        return 'Array<number>';
      case '_bool':
        return 'Array<boolean>';
      case '_varchar':
      case '_text':
      case '_citext':
      case '_uuid':
      case '_bytea':
        return 'Array<string>';
      case '_json':
      case '_jsonb':
        return 'Array<Object>';
      case '_timestamptz':
        return 'Array<Date>';
      default:
        return 'any';
    }
  };
