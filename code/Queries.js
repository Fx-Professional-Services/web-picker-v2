import { PerformScriptWithOption } from "../helpers/PerformScriptWithOption.js";

/**
 * This will execute a script in FileMaker, named "sub: Load picker data (web picker)"
 * @param {*} param - The data to pass to the script.
 */
export function loadPickerData(param) {
  PerformScriptWithOption(
    "sub: Load picker data (web picker)",
    JSON.parse(param),
    "5"
  );
}

/**
 * This will execute a script in FileMaker, named "sub: Cancel button (web picker)"
 */
export function cancelButton() {
  PerformScriptWithOption("sub: Cancel button (web picker)", "", "5");
}

/**
 * This will execute a script in FileMaker, named "sub: Search (web picker)"
 * 
 * @param {string} searchText - The search text.
 * @param {string} column - The column to search.
 */
export function searchFilter(searchText, column) {
  const param = {
    searchText,
    column,
  };
  PerformScriptWithOption("sub: Search (web picker)", param, "5");
}
