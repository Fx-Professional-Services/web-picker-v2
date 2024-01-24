import { loadPickerData } from "./Queries";

/**
 * Sets the configuration.
 * This will be called in the File Maker side.
 *
 * @param {Object} config - The configuration object.
 * @returns {Object} - The processed configuration data.
 */
function setConfig(config) {
  // Parse the raw configuration data -- This to be removed
  const parsedConfig = JSON.parse(config);

  // Initialize the columns, displayColumn, and columns_config arrays
  const displayColumn = [];
  const columns_config = [];

  // This is for getting the field reference (FM) from the columns config
  parsedConfig.columns_config.forEach(function (column) {
    const fieldName = column.field_name;

    // For version 1 of the columns config -- This to be removed
    columns.push(fieldName);

    // For version 2 of the columns config, for now it's redundant
    columns_config.push({
      field_name: fieldName,
      column_name: column.column_name,
    });
  });

  // This is the array of column names to display in the table
  parsedConfig.columns_config.forEach(function (column) {
    displayColumn.push(column.column_name);
  });

  // Get the search columns
  const searchColumns = columns_config.map((column) => column.field_name);

  // Get the number of columns
  const number_of_columns = displayColumn.length;

  // Get the price column
  let priceColumn;
  let priceDisplayColumn;
  parsedConfig.columns.forEach(function (column) {
    if (column.is_price) {
      priceColumn = column.field_name;
      priceDisplayColumn = column.column_name;
    }
  });
  
  loadPickerData(JSON.stringify(parsedConfig));

  // Return the processed configuration data
  return {
    onSubmit: parsedConfig.script_name,
    config: parsedConfig,
    showCart: parsedConfig.show_cart,
    fields_to_pick: parsedConfig.fields_to_pick,
    layout_name: parsedConfig.layout_name,
    quantity_field: parsedConfig.quantity_field,
    id_field: parsedConfig.id_field,
    table_name: parsedConfig.table_name,
    columns,
    columns_config,
    searchColumns,
    displayColumn,
    number_of_columns,
    priceColumn,
    priceDisplayColumn,
  };
}
