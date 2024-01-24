/**
 * Draws a cart visualization on the specified table element.
 * 
 * @param {HTMLTableElement} table - The table element to draw the cart on.
 * @param {Array} columns - An array of column objects containing information about each column.
 * @param {Array} rows - An array of row objects containing information about each row already in cart.
 * @param {Object} id - The identifier object for the cart.
 * @param {string} id.key_name - The key name of the identifier object.
 * @returns {Map} - A Map object containing the selected items in the cart.
 * @throws {Error} - If table, columns, rows, or id.key_name is missing.
 */
function drawCart(table, columns, rows, id) {
	const selectedItems = new Map();

	if (!table) {
		throw new Error('drawCart: table is required');
	} else if (!columns) {
		throw new Error('drawCart: columns is required');
	} else if (!rows) {
		throw new Error('drawCart: rows is required');
	} else if (!id.key_name) {
		throw new Error('drawCart: id.key_name is required');
	}

	// create header row
	const header = document.createElement('tr');

	// create columns and append to header
	columns.forEach(column => {

		// get data about this column
		const { name, type, item_field_name, editable, format, var_name } = column;

		// create th and td
		const th = document.createElement('th');

		// set name
		th.textContent = name.toString();

		// typecast and set data attributes
		th.dataset.type = type.toString();
		th.dataset.item_field_name = item_field_name.toString();
		th.dataset.editable = Boolean(editable);
		th.dataset.format = format.toString();
		if (var_name) {
			th.dataset.var_name = var_name.toString()
		}

		// append th to header
		header.appendChild(th);

	});

	// append header to table
	table.appendChild(header);


	// create rows and append to table
	rows.forEach(row => {

		// add rows as selected Items and add to cart table
		selectItem(row, id, selectedItems, columns, table);

	});

	return selectedItems;
}

/**
 * Adds an item to the selectedItems map based on the provided parameters.
 * If a cart is provided, the item is added to the cart using the specified columns and id.
 * If no cart is provided, a new UUID is generated and used as the id for the item.
 * @param {Object} itemJson - The JSON representation of the item to be added.
 * @param {Object} id - The object containing information about the id column.
 * @param {string} id.key_name - The name of the key in the itemJson object that represents the id.
 * @param {Map} selectedItems - The map of selected items.
 * @param {Array} columns - The columns to be used when adding the item to the cart.
 * @param {HTMLTableElement} cart - The cart table element.
 * @returns {Map} - The updated map of selected items.
 */
function selectItem(itemJson, id, selectedItems = new Map(), columns, cart) {

	if (cart && !columns && !id) {
		throw new Error('selectItem: columns and id are required if cart is provided');
	}

	let id_value;

	// add item to cart
	if (cart && columns && id) {
		id_value = addItemToCart(cart, itemJson, columns, id);
	} else {
		// generate UUID
		id_value = uuidv4();
	}

	// add item to selectedItems
	selectedItems.set(id_value, itemJson);

	return selectedItems;
}

/**
 * Adds an item to the cart table.
 * 
 * @param {HTMLTableElement} table - The table element to which the item will be added.
 * @param {Object} itemJson - The JSON object containing the item data.
 * @param {Array} columns - An array of column objects defining the table columns.
 * @param {Object} id - The object containing the key name for the item ID.
 * @returns {string} - The ID value of the added item.
 */
function addItemToCart(table, itemJson, columns, id) {
	// create row
	const tr = document.createElement('tr');

	// loop through columns to create cells
	columns.forEach(column => {

		// create td
		const td = document.createElement('td');

		// get data about this column
		const { item_field_name, type, editable, default_value, var_name } = column;

		// find the value for this column in the itemJson object
		const value = itemJson[item_field_name] || default_value || '';

		// typecast value
		let typedValue;
		if (type === 'number') {
			typedValue = parseFloat(value);
		} else if (type === 'boolean') {
			typedValue = value === 'true';
		} else {
			typedValue = value.toString();
		}


		// set editable
		td.contentEditable = editable;

		// set value
		td.textContent = typedValue;

		// set var_name so we can get the value later
		td.dataset.var_name = var_name;

		// if this is editable and has a var_name, add an event listener 
		// to emit an event when the value is changed
		if (editable && var_name) {
			tr.addEventListener('input', event => {


				// get the var_name
				const var_name = event.target.dataset.var_name;

				// get the value
				const value = event.target.textContent;

				console.log(`variableChanged: ${var_name} = ${value}`)

				// create event
				const customEvent = new CustomEvent('variableChanged', {
					detail: {
						var_name,
						value
					}
				});

				// dispatch event
				tr.dispatchEvent(customEvent);
			});
		}

		// append to tr
		tr.appendChild(td);
	});

	// get id value from itemJson data
	const id_key = id.key_name;

	// if the itemJson contains an id, use it, otherwise generate a UUID
	let id_value;
	if (!itemJson[id_key]) {
		// generate UUID
		id_value = crypto.randomUUID();
	} else {
		// it has an id because it came in as script parameter
		id_value = itemJson[id_key].toString();
	}

	// set id as attribute of the tr
	tr.dataset.row_id = id_value;

	// append tr to table
	table.appendChild(tr);

	return id_value;
}

/**
 * Returns an array of selected items with additional data and transformed values.
 * 
 * @param {Map} selectedItems - The map of selected items.
 * @param {Object} template - The template object.
 * @param {string} id - The key name for the id.
 * @param {Array} columns - The array of column names.
 * @param {Object} cart - The cart object.
 * @returns {Array} - The array of selected items with additional data and transformed values.
 */
function returnSelectedItems(selectedItems, template, id, columns, cart) {
	// loop through selectedItems Map
	const results = [];
	for (const [key, value] of selectedItems) {

		// start with the value
		const result = value;

		// add the id to data
		result[id.key_name] = key;

		// transform the item
		const transformed = transformItem(result, template, key, columns, cart);

		// add to results
		results.push(transformed);
	}

	// return results
	return results;
}

/**
 * Transforms an item based on the provided itemJson, template, id, columns, and cart.
 * @param {Object} itemJson - The JSON object representing the item.
 * @param {Object} template - The template object used for transformation.
 * @param {string} id - The ID of the item.
 * @param {Array} columns - The array of columns.
 * @param {HTMLElement} cart - The cart element.
 * @returns {Object} - The transformed item object.
 */
function transformItem(itemJson, template, idString, columns, cart) {
	// create result object
	const result = {};
	// const vars = {};

	// get the row from the cart
	const row = cart.querySelector(`tr[data-row_id="${idString}"]`);

	// throw error if row not found
	if (!row) {
		throw new Error(`transformItem: row not found ${idString}`);
	}

	// get the vars
	const vars = getVars(columns, row);

	// loop through the template object
	for (const [key, value] of Object.entries(template)) {
		// determine the value to set: either field, value, or template literal
		if (itemJson.hasOwnProperty(value)) {
			// if the value is a key name, get the value from the itemJson object
			result[key] = itemJson[value];
		} else if (typeof value === 'string' && value.startsWith('`') && value.endsWith('`')) {
			// if the value is a string containing a template literal, evaluate it
			string = value.replaceAll('`', '');
			evaluated = eval(value);
			result[key] = evaluated;
		} else {
			// otherwise, set the value directly
			result[key] = value;
		}
	}

	// return the result
	return result;
}


function getVars(columns, row) {
	const vars = {};
	const columns_with_var_names = columns.filter(column => column.var_name);
	// get row id
	const row_id = row.dataset.row_id;

	// loop through columns and save the values to dynamically named vars
	columns_with_var_names.forEach(column => {

		// get the var_name
		const { var_name } = column;

		// get the value from the row
		const value = row.querySelector(`td[data-var_name="${var_name}"]`).textContent;

		// set the value on the item
		vars[var_name] = value;

	});

	// add id
	vars.id = row_id;

	return vars;
}
