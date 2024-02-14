class FmCart {
	constructor(rows, cols, idKeyName, template, options) {
		this.cart = document.createElement('table');
		this.id = { key_name: idKeyName };
		this.columns = cols;
		this.rows = rows || [];
		this.sums = {};
		this.template = template;
		this.auto_submit = options?.auto_submit || false;
		this.maxResults = options?.max_results || Infinity;


		try {
			// draw the header and rows
			this.selectedItems = this.#drawCart(this.cart, this.columns, this.rows, this.id);
			return this;

		} catch (error) {
			throw error;
		}
	}

	// getter for results
	get results() {
		return this.#returnSelectedItems(
			this.selectedItems,
			this.template,
			this.id,
			this.columns,
			this.cart);
	}

	/**
	 * Adds an item to the cart.
	 * @param {Object} itemJson - The JSON object representing the item to be added.
	 */
	addItem(itemJson) {
		// this.selectedItems = 
		this.#selectItem(itemJson, this.id, this.selectedItems, this.columns, this.cart);
	}

	deleteItem(id) {
		// this.selectedItems = 
		this.#deleteRow(id, this.selectedItems, this.cart);
	}

	#createHeader(columns) {
		const header = document.createElement('thead');
		const row = document.createElement('tr');
		header.appendChild(row);

		columns.forEach(column => {
			const { name, type, item_field_name, editable, format, var_name } = column;
			const th = document.createElement('th');
			th.textContent = name.toString() || '';
			th.dataset.type = type.toString() || '';
			th.dataset.item_field_name = item_field_name?.toString() || '';
			th.id = `col-${name}`
			// th.dataset.editable = Boolean(editable);

			if (editable) {
				// add editable attribute
				th.setAttribute('editable', '')
			}

			if (format) {
				th.dataset.format = format.toString();
			}

			if (var_name) {
				th.dataset.var_name = var_name.toString()
			}

			row.appendChild(th);
		});

		// add column for delete button
		const th = document.createElement('th');
		// th.textContent = 'Delete';
		th.classList.add('last-column');
		row.appendChild(th);

		return header;
	}

	#drawCart(table, columns, rows, id) {



		if (!table) {
			throw new Error('drawCart: table is required');
		} else if (!columns) {
			throw new Error('drawCart: columns is required');
		} else if (!rows) {
			throw new Error('drawCart: rows is required');
		} else if (!id.key_name) {
			throw new Error('drawCart: id.key_name is required');
		}

		try {
			table.classList.add('fm-cart', 'styled-table');

			// create table body
			const tbody = document.createElement('tbody');

			const selectedItems = new Map();

			// create header row
			const header = this.#createHeader(columns);

			// create footer
			const footer = this.#createFooter(columns);

			// append header to table
			table.appendChild(header);

			// append tbody to table
			table.appendChild(tbody);

			// append footer to table
			table.appendChild(footer);

			// create rows and append to table
			rows.forEach(row => {
				// add rows as selected Items and add to cart table
				this.#selectItem(row, id, selectedItems, columns, table);

			});



			return selectedItems;

		} catch (error) {
			throw error;
		}

	}

	#selectItem(itemJson, id, selectedItems = new Map(), columns, cart) {


		// get table body
		const table = cart.querySelector('tbody');

		if (cart && !columns && !id) {
			throw new Error('selectItem: columns and id are required if cart is provided');
		}

		let id_value;
		let id_key = id.key_name;

		if (selectedItems.size >= this.maxResults) {
			// if the count of selectedItems is greater than or equal to maxResults, do nothing

			return selectedItems;

		} else if (selectedItems.has(itemJson[id_key])) {
			// add item to cart if it's not already in selectedItems map
			// do nothing
			return selectedItems;

		} else if (cart && columns && id) {
			id_value = addItemToCart.call(this, table, itemJson, columns, id);
		} else {
			// generate UUID
			id_value = crypto.randomUUID();
		}

		// add item to selectedItems
		selectedItems.set(id_value, itemJson);

		this.selectedItems = selectedItems;

		// emit event
		if (selectedItems.size >= this.maxResults) {
			const customEvent = new CustomEvent('maxResults', {

				// allow event to bubble up
				bubbles: true,

				detail: {
					maxResults: this.maxResults,
					auto_submit: this.auto_submit,
				}
			});


			// dispatch event
			cart.dispatchEvent(customEvent);
		}

		return selectedItems;


		/**
		 * Adds an item to the cart table.
		 * 
		 * @param {HTMLElement} table - The table element where the item will be added.
		 * @param {object} itemJson - The JSON object representing the item.
		 * @param {Array} columns - An array of column objects defining the structure of the table.
		 * @param {object} id - The ID object containing the key name for the item ID.
		 * @returns {string} - The ID value of the added item.
		 */
		function addItemToCart(table, itemJson, columns, id) {

			// get table body
			const tbody = table;

			// create row element,
			// includes vars object to store values for variables
			// and event listener to update vars object when variableChanged event is emitted
			const tr = this.#createTr();

			// define array of callbacks to fire sumColumn function
			const callbacks = [];

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

			// loop through columns to create cells
			columns.forEach(column => {

				// create td element
				// includes event listener to emit variableChanged event when value is changed
				const td = this.#createTd(column);
				const element = td.querySelector('input') || td;

				// get data about this column
				const { item_field_name, type, default_value, var_name, add_sum } = column;

				// find the value for this column in the itemJson object
				const value = itemJson[item_field_name] || default_value || '';

				// typecast value
				let typedValue;
				if (type === 'number') {
					typedValue = parseFloat(value) || 0;
				} else if (type === 'boolean') {
					typedValue = value === 'true';
				} else {
					typedValue = value.toString();
				}

				// set value
				if (element.tagName === 'INPUT') {
					element.value = typedValue;
				} else {
					element.textContent = typedValue;
				}

				// update vars object
				if (var_name) {
					tr.vars[var_name] = typedValue;
				}

				if (add_sum) {

					// adding a callback so that the sumColumn function is fired after all the cells are created

					//sum the column
					const callback = () => {

						this.#sumColumn(column.name, column.max_sum);
					}

					// add callback to array
					callbacks.push(callback);
				}

				// append to tr
				tr.appendChild(td);
			});

			// evaluate expressions
			this.#updateExpressions(tr);


			// create delete button
			const deleteButton = document.createElement('button');
			deleteButton.textContent = 'Delete';
			deleteButton.addEventListener('click', event => {
				this.#deleteRow(id_value, selectedItems, cart);
			});

			// create td for delete button
			const td = document.createElement('td');
			td.appendChild(deleteButton);

			// append td to tr
			tr.appendChild(td);

			// append tr to table
			tbody.appendChild(tr);

			// fire sumColumn function
			callbacks.forEach(callback => {
				callback();
			});


			return id_value;
		}

	}

	#returnSelectedItems(selectedItems, template = this.template, id, columns, cart) {
		// loop through selectedItems Map
		const results = [];
		const errors = [];
		const columnsToValidate = columns.filter(column => column.max_sum);

		for (const [key, value] of selectedItems) {

			// start with a clone of the itemJson
			const result = { ...value };

			// add id and name it after the key_name
			result[id.key_name] = key;

			// transform the item
			const transformed = this.#transformItem(result, template, key, columns, cart);

			// add to results
			results.push(transformed);
		}

		// validate the sums
		columnsToValidate.forEach(column => {
			const { name, max_sum, var_name, item_field_name } = column;
			const sum = this.sums[var_name || item_field_name || name];

			if (max_sum > 0 && sum > max_sum) {
				errors.push(`The sum of ${name} is greater than ${max_sum}`);
			}
		});

		// alert if there are errors
		if (errors.length > 0) {
			// alert(errors.join('\n'));

			// add to result
			results.validation_errors = errors;

			// emit event
			const customEvent = new CustomEvent('validationErrors', {

				// allow event to bubble up
				bubbles: true,

				detail: {
					errors
				}
			});

			// dispatch event
			cart.dispatchEvent(customEvent);
		}

		console.log('results', results);

		// return results
		return results;
	}

	#transformItem(itemJson, template, idString, columns, cart) {
		// create result object
		const result = {};

		// get the row from the cart
		const row = cart.querySelector(`tr[data-row_id="${idString}"]`);

		// throw error if row not found
		if (!row) {
			throw new Error(`transformItem: row not found ${idString}`);
		}

		// get the vars
		const vars = this.#getVars(columns, row);

		// loop through the template object
		for (const [key, value] of Object.entries(template)) {
			// determine the value to set: either field, value, or template literal

			if (itemJson.hasOwnProperty(value)) {
				// if the value is a key name, get the value from the itemJson object

				result[key] = itemJson[value];

			} else if (typeof value === 'string' && value.startsWith('`') && value.endsWith('`')) {
				// if the value is a string containing a template literal, evaluate it

				const evaluated = eval(value);
				result[key] = evaluated;

			} else {
				// otherwise, set the value directly

				result[key] = value;

			}
		}

		// return the result
		return result;
	}

	#getVars(columns, row) {
		const vars = {};
		const columns_with_var_names = columns.filter(column => column.var_name);
		// get row id
		const row_id = row.dataset.row_id;

		// loop through columns and save the values to dynamically named vars
		columns_with_var_names.forEach(column => {

			// get the var_name
			const { var_name } = column;

			// get the value from the row
			const td = row.querySelector(`td[data-var_name="${var_name}"]`)

			// get the value
			const value = td.querySelector('input')?.value || td.textContent;

			// set the value on the item
			vars[var_name] = value;

		});

		// add id
		vars.id = row_id;

		return vars;
	}

	#createTr() {
		// create row
		const tr = document.createElement('tr');

		// add vars object to row
		tr.vars = {};

		// add event listener to update the vars object when a variableChanged event is emitted
		// and stop the event from bubbling up
		// and update expressions
		//	- get all expression cells
		tr.addEventListener('variableChanged', handleVariableChanged.bind(this));

		function handleVariableChanged(event) {

			event.stopPropagation();

			// get the var_name and value
			const var_name = event.detail.var_name;
			const value = event.detail.value;

			// update vars
			tr.vars[var_name] = value;

			// update expressions
			this.#updateExpressions(tr);

			// fire sumColumn function for any colums that have add_sum
			this.columns.forEach(column => {
				if (column.add_sum) {
					this.#sumColumn(column.name, column.max_sum);
				}
			});


		}

		return tr;
	}

	#createTd(column, tablePart = 'body') {
		// create td
		const td = document.createElement('td');

		// get data about this column
		const { name,
			item_field_name,
			type, editable,
			var_name,
			format,
			add_sum,
			max_sum } = column;

		// set editable
		if (editable && type !== 'expression') {
			// create input
			const input = document.createElement('input');
			input.type = type;
			// append input to td
			td.appendChild(input);

			// add event listeners
			input.addEventListener('change', handleChange.bind(this));
		}

		// set var_name so we can get the value later
		if (var_name) {
			td.dataset.var_name = var_name;
		}

		// add other attributes
		td.dataset.type = type;
		td.dataset.item_field_name = item_field_name;
		td.dataset.editable = editable;
		td.dataset.format = format;
		td.headers = `col-${name}`;

		if (item_field_name) {
			td.dataset.item_field_name = item_field_name;
		}

		if (type === 'expression') {
			td.dataset.expression = column.expression;
		}



		function handleChange(event) {

			// get the column name
			const columnName = event.target.parentElement.headers.split('-')[1];

			// get column object 
			const columnObject = this.columns.find(column => column.name === columnName);

			// get the var_name
			const { var_name } = columnObject;

			const value = event.target.value;


			// create event
			const variableChangedEvent = new CustomEvent('variableChanged', {

				// allow event to bubble up
				bubbles: true,

				detail: {
					var_name,
					value
				}
			});

			// dispatch event
			td.dispatchEvent(variableChangedEvent);
		}

		return td;
	}

	/**
	 * Creates a footer element with a row containing table cells based on the given columns.
	 * includes sum cells for columns with add_sum set to true.
	 * @param {Array} columns - An array of column objects.
	 * @returns {HTMLElement} - The created tfoot element.
	 */
	#createFooter(columns) {
		// create footer, row
		const tfoot = document.createElement('tfoot');
		const tr = document.createElement('tr');

		// append tr to tfoot
		tfoot.appendChild(tr);

		// loop through columns
		columns.forEach((column) => {
			// create td
			const td = this.#createTd(column);

			// delete the editable attribute
			td.removeAttribute('contenteditable');

			if (column['add_sum']) {
				// add a class to the td
				td.classList.add('sum');
			}

			// append td to tfoot
			tr.appendChild(td);
		});

		return tfoot;
	}

	#updateExpressions(tr) {

		// get all expression cells
		const expression_cells = tr.querySelectorAll('td[data-type="expression"]');

		// loop through expression cells
		expression_cells.forEach(cell => {

			// get the expression
			const expression = cell.dataset.expression

			// get the vars
			const vars = tr.vars;

			// evaluate the expression
			const evaluated = eval(expression);

			// set the value on the element
			// may be an input or a td
			cell.textContent = evaluated;

			// update vars
			const var_name = cell.dataset.var_name;
			tr.vars[var_name] = evaluated;

		});

		return tr;
	}

	#deleteRow(id, selectedItems, cart) {
		// get the row
		const row = cart.querySelector(`tr[data-row_id="${id}"]`);

		// remove from selectedItems
		selectedItems.delete(id);

		// remove from cart
		row.remove();

		this.selectedItems = selectedItems;

		// fire sumColumn function
		this.columns.forEach(column => {
			if (column.add_sum) {
				this.#sumColumn(column.name, column.max_sum);
			}
		});

		return selectedItems;
	}

	#sumColumn(columnName, maxSum = Infinity) {

		// if maxSum is not a number, set to infinity
		if (typeof maxSum !== 'number' || maxSum <= 0) {
			maxSum = Infinity;
		}

		// get the column
		const column = this.cart.querySelectorAll(`tbody td[headers="col-${columnName}"]`);

		// get the column config
		const columnConfig = this.columns.find(column => column.name === columnName);
		const { var_name, item_field_name, summary_format_locale: locale, summary_format_options: format_options } = columnConfig;

		// get the values
		const values = Array.from(column).map(td => {

			let element = td.querySelector('input') || td;
			let content = element.value || element.textContent;

			// remove all non-numeric characters
			content = content.replace(/[^0-9.]/g, '');

			const value = parseFloat(content) || 0;
			return value;
		});

		// sum the values
		const sum = values.reduce((a, b) => a + b, 0);

		// select the footer cell
		const footerCell = this.cart.querySelector(`tfoot td[headers="col-${columnName}"]`);


		// set the value
		if (locale && format_options) {
			const formatter = new Intl.NumberFormat(locale, format_options);
			footerCell.textContent = formatter.format(sum);
		} else {
			footerCell.textContent = sum
		}

		// set value on this
		this.sums[var_name || item_field_name || columnName] = sum.toFixed(2);

		// create sumUpdated event
		const event = new CustomEvent('sumUpdated', {
			bubbles: true,
			detail: {
				columnName,
				sum
			}
		});

		// dispatch event
		footerCell.dispatchEvent(event);

		// alert if sum is greater than maxSum
		if (sum > maxSum) {
			console.error(`The sum of ${columnName} is greater than ${maxSum}`);
		}

		return footerCell;
	}

}