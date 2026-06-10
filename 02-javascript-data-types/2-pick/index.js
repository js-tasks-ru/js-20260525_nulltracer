/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...fields) => {
  const fieldSet = new Set(fields);

  const pickedEntries = Object.entries(obj)
    .filter(([key]) => fieldSet.has(key));

  return Object.fromEntries(pickedEntries);
};
