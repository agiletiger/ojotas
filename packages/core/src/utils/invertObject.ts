export const invertObject = (
  object: Record<string, string>,
): Record<string, string> => {
  const invertedObject: Record<string, string> = {};
  for (const key in object) {
    // eslint-disable-next-line no-prototype-builtins
    if (object.hasOwnProperty(key)) {
      invertedObject[object[key]] = key;
    }
  }
  return invertedObject;
};
