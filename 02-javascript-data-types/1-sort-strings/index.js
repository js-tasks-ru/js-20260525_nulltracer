const collator = new Intl.Collator(["ru", "en"], { caseFirst: "upper" });

/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */

export function sortStrings(arr, param = "asc") {
  const sortedArray = arr.toSorted(collator.compare);

  return param === "asc" ? sortedArray : sortedArray.toReversed();
}
