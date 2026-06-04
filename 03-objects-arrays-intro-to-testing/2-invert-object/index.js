/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns the new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  if (obj === undefined) {
    return undefined;
  }

  const entries = Object.entries(obj);

  return Object.fromEntries(entries.map(entry => entry.reverse()));
}
