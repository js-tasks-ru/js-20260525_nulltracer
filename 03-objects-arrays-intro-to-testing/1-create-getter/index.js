/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const pathSegments = path.split(".");

  return (obj) => {
    let currentValue = obj;

    for (const key of pathSegments) {
      if (!Object.hasOwn(currentValue, key)) {
        return undefined;
      }

      currentValue = currentValue[key];
    }

    return currentValue;
  };
}
