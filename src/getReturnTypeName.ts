import { capitalize } from './utils/capitalize';

export const getReturnTypeName = (queryName: string) =>
  `I${capitalize(queryName)}QueryResultItem`;
