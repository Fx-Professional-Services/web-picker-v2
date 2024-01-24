/**
 * This function will load data from a script into a table.
 * This function will be called in File Maker side
 * 
 * @param {*} data - The data to pass to the script.
 * @returns {Array} items - The array of items to be loaded into the table.
 */
function setTableData(data) {
  data = JSON.parse(data);
  let items = [];
  //Fill table with data
  data.forEach(function (item) {
    let keys = Object.keys(item.fieldData);
    let values = Object.values(item.fieldData);
    let obj = {};
    for (let i = 0; i < keys.length; i++) {
      obj[keys[i]] = values[i];
    }
    items.push(obj);
  });
  console.log(items);
  return items;
}
