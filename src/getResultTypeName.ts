const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getResultTypeName = (queryName: string) =>
  `I${capitalize(queryName)}QueryResultItem`;
