/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
  const fieldSet = new Set(fields);

  const pickedEntries = Object.entries(obj)
    .filter(([key]) => !fieldSet.has(key));

  return Object.fromEntries(pickedEntries);
};
