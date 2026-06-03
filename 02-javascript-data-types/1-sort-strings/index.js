/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const supportedLanguages = ['ru', 'en'];

  const options = {
    caseFirst: "upper",
  };

  const collator = new Intl.Collator(supportedLanguages, options);

  const sortedArray = arr.toSorted(collator.compare);

  return param === 'asc' ? sortedArray : sortedArray.reverse();
}

}
