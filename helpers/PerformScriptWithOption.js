/**
 * Perform a FileMaker script with an option.
 * 
 * @param {string} scriptName - The name of the script to perform.
 * @param {string} data - The data to pass to the script.
 * @param {string} option - The option to pass to the script. [0, 1, 2, 3, 4, 5]
 * **/
export function PerformScriptWithOption(scriptName, data, option) {
    data = JSON.stringify(data) || '';
    FileMaker.PerformScriptWithOption(scriptName, data, option);
}