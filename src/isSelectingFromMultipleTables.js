export const isSelectingFromMultipleTables = (sql) => {
  const columns = [
    ...new Set(
      sql
        .match(/(?<=select).*(?=from)/gi)[0]
        .replace(/\s+/gi, '')
        .split(','),
    ),
  ];
  if (
    columns.length === 1 ||
    !columns.some((c) => c.includes('.')) ||
    columns.filter((c) => c.includes('.')).map((c) => c.split('.')[0])
      .length === 1
  ) {
    return false;
  }

  return true;
};
