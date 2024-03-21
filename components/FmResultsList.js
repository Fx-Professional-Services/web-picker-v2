import FmComponent from 'https://cdn.jsdelivr.net/gh/Fx-Professional-Services/web-picker-v2@testing-modules/components/FmCart.js';


class FmResultsList extends FmComponent {
	// static methods
	static get observedAttributes() {
		return [''];
	}
	// static properties

	// private properties
	#firstRequest
	#lastRequest
	#response;//testResponse.response

	// constructor
	constructor() {
		try {
			super();

			// private properties
			this.columns = []; // the columns to display in the table
			this.idKeyName; // the name of the key field in the data
			this.allowDuplicates; // whether to allow duplicate items in the cart
			this.findType = 'AND'; // the type of search either 'AND' or 'OR'

			// render the component
			this.render();



		} catch (error) {
			throw error;
		}
	}

	/* lifecycle methods */

	/**
	 * Called when the custom element is connected to the DOM.
	 * Adds event listeners and requests data if available.
	 * @throws {Error} If an error occurs during execution.
	 */
	connectedCallback() {
		try {
			// add event listeners


		} catch (error) {
			throw error;
		}

	}

	/**
	 * Renders the component.
	 * @throws {Error} If an error occurs during rendering.
	 */
	render() {
		try {
			// call this during constructor
			// call super.render() first to seed the shadowRoot
			super.render();

			// build the table
			this.#addColumns();
			this.#addSearch();
			this.#addSummaries();

			if (this.response) {
				this.#addRows();
				this.#updateSummaries();
			}

			this.ids['prev-button'].addEventListener('click', this.#prevPage.bind(this));
			this.ids['next-button'].addEventListener('click', this.#nextPage.bind(this));

		} catch (error) {
			throw error;
		}

	}

	// getters
	get template() {
		return /*html*/ `
		<table>
				<thead>
					<tr id='title-row'>
						<td id='title-cell'>Table Title</td>
					</tr>
					<tr id='search-row'></tr>
					<tr id='label-row'></tr>
				</thead>
				<tbody>
				</tbody>
				<tfoot>
					<tr id='summary-row'></tr>
					<tr id='buttons-row'>
						<td id='buttons-cell'>
							<picker-button id='prev-button'>Previous</picker-button>
							<picker-button id='next-button'>Next</picker-button>
						</td>
					</tr>
				</tfoot>
			</table>
		`;
	}

	get styles() {
		return /*css*/ `

		thead {
			background-color: #f0f0f0;
			position: sticky;
			top: 0;
			border-bottom: 1px solid #000;
		}

		tfoot {
			background-color: #f0f0f0;
			position: sticky;
			bottom: 0;
			border-top: 1px solid #000;
		}

		table {
			width: 100%;
			border-collapse: collapse;
		}

		th {
			text-align: left;
		}

		th input {
			width: 90%;
		}

		`;
	}

	get response() {
		return this.#response;
	}

	get request() {
		return this.#lastRequest;
	}

	// setters
	set response(response) {

		// validate the response
		if (!response) {
			throw new Error('No response object');
		} else if (!response.data) {
			throw new Error('No data object in response');
		} else if (!response.dataInfo) {
			throw new Error('No dataInfo object in response');
		}

		// save the response
		this.#response = response;
		// get the data from the response
		const { data, dataInfo } = response;

		// save the data info
		({
			database: this.database,
			layout: this.layout,
			table: this.table,
			totalRecordCount: this.totalRecordCount,
			foundCount: this.foundCount,
			returnedCount: this.returnedCount
		} = dataInfo)

		// fully qualify all field names
		data.forEach((record, index) => { 
			// for each key in fieldData
			const { fieldData } = record;
			Object.keys(fieldData).forEach(key => {
				if (!key.includes("::")) {
					fieldData[`${this.table}::${key}`] = fieldData[key];
					delete fieldData[key];
				}
			});
		});

		this.records = data;

		// update the table
		this.render();
	}

	set request(request) {
		// add any required properties to the request
		if (!request.limit) {
			request.limit = 100;
		}
		if (!request.offset || request.offset < 1) {
			request.offset = 1;
		}

		({
			offset: this.offset,
			limit: this.limit,
		} = request)

		// save the last request
		this.#lastRequest = { ...request };

		if (!this.#firstRequest) {
			// save a complete clone of the first request
			console.log('saving first request', request)
			this.#firstRequest = Object.freeze({ ...request });

		}

		// perform the request
		this.#performRequest();


	}

	/* public methods */

	/* private methods */
	#performRequest() {
		// get the data from FileMaker
		if (!this.request) {
			throw new Error('No request object');
		} 

		// call the script
		const options = {
			script: FmComponent.RequestScriptName,
			script_parameter: this.request,
			callback: {
				function_name: 'setResultsListData',
				options: {
					id: this.id,
				}
			}
		}

		// call the script
		this.callBridgeScript(options, FmComponent.ScriptOptions.Suspend);

	}

	/**
	 * Adds columns to the label row.
	 * @private
	 */
	#addColumns() {
		if (!this.columns) {
			throw new Error('No columns set');
		}

		// get the label row
		const labelRow = this.shadowRoot.querySelector('#label-row');

		// add the labels to the label row
		this.columns.forEach((column, index) => {
			const { name } = column;
			const th = document.createElement('th');
			th.innerHTML = name;
			th.id = `label-${index}`;
			// add this to columns object
			column.id = index;
			labelRow.appendChild(th);
		});

		// add one td for the search
		const th = document.createElement('th');
		labelRow.appendChild(th);

		const titleCell = this.shadowRoot.querySelector('#title-row td');
		const buttonsCell = this.shadowRoot.querySelector('#buttons-cell');
		titleCell.colSpan = this.columns.length + 1;
		buttonsCell.colSpan = this.columns.length + 1;

	}

	/**
	 * Adds search inputs to the search row.
	 */
	#addSearch() {
		// get the search row
		const searchRow = this.shadowRoot.querySelector('#search-row');

		// add the search inputs to the search row
		this.columns.forEach((column, index) => {
			const { name, searchable, type, id } = column;
			const th = document.createElement('th');

			if (searchable) {
				// add an input to the th
				const input = document.createElement('input');
				input.type = 'text';
				input.id = `search-${id}`;
				input.placeholder = `Search ${name}`;

				// add input event listener
				input.addEventListener('change', this.#performFind.bind(this));
				th.appendChild(input);
			}

			// add the th to the search row
			searchRow.appendChild(th);

		});

	}

	/**
	 * Adds summaries to the summary row.
	 */
	#addSummaries() {
		// get the summary row
		const summaryRow = this.shadowRoot.querySelector('#summary-row');

		// add the summaries to the summary row
		this.columns.forEach((column) => {
			const { id, format, add_sum: addSum } = column;
			const th = document.createElement('th');
			th.id = `summary-${id}`;

			if (addSum && format) {
				// initialize value to 0
				const { locale, options } = format;
				th.innerHTML = new Intl.NumberFormat(locale, options).format(0);
			}

			summaryRow.appendChild(th);
		});

		// add one th for the search button
		const th = document.createElement('th');
		summaryRow.appendChild(th);


	}

	/**
	 * Adds rows to the results list.
	 * @private
	 */
	#addRows() {
		if (!this.response) {
			throw new Error('No response object');
		}

		// get the data from the response
		const { data, dataInfo } = this.response;

		// get the total record count
		const { totalRecordCount } = dataInfo;

		data.forEach((record, index) => {
			const tr = this.#addRow(record);
		})
	}

	/**
	 * Adds a new row to the table with the provided record.
	 * 
	 * @param {Object} record - The record to be added to the row.
	 * @returns {HTMLTableRowElement} - The newly created row element.
	 */
	#addRow(record) {
		// get the tbody
		const tbody = this.shadowRoot.querySelector('tbody');

		// create a tr element
		const tr = document.createElement('tr');

		// add data to the row
		tr.record = record;

		// get the record id
		const recordId = record?.fieldData[this.idKeyName] || record[this.idKeyName] || '';

		if (!recordId) {
			throw new Error('No record id found in record data at key: ' + this.idKeyName);
		}

		tr.dataset.recordId = recordId;

		// add a uuid for the row
		/**
		 * to ensure that record is recognized as a duplicate
		 * between renders and if there is more than one results list,
		 * we assign a unique row id but also retrieve the record id
		 * from the data and assign it to the row as well.
		 */
		tr.id = crypto.randomUUID();

		// add the record id, fallback to the row id
		tr.recordId = recordId

		// add a vars object
		tr.vars = {};

		// add the cells to the row
		this.columns.forEach(column => {
			const td = this.#addCell(column, record, tr);
			tr.appendChild(td);
		});

		// add one additional cell for the search button
		const td = document.createElement('td');
		tr.appendChild(td);

		// add the row to the tbody
		tbody.appendChild(tr);

		return tr;
	}

	/**
	 * Creates and returns a table cell element based on the given column and record.
	 * 
	 * @param {Object} column - The column object containing information about the cell's column.
	 * @param {Object} record - The record object containing data for the row.
	 * @returns {HTMLTableCellElement} - The created table cell element.
	 */
	#addCell(column, record, row) {
		// create a td element
		const td = document.createElement('td');

		// get info from the column
		const { item_field_name: fieldName, name, id, type, format } = column;
		const { fieldData } = record;
		let value = fieldData[fieldName];
		value = format ? new Intl.NumberFormat(format.locale, format.options).format(value) : value;

		if (type === 'cart-button') {
			// create a button
			const button = document.createElement('picker-button');
			button.innerHTML = name || 'Select';
			td.append(button);

			// add event listener
			button.addEventListener('click', this.#handleClickAddToCart.bind(this));

		} else {
			// get the field data from the record
			td.innerHTML = value;

		}

		td.headers = `label-${id}`;

		return td;
	}

	/**
	 * Updates the summaries for the formatted columns.
	 * @private
	 */
	#updateSummaries() {
		// get the columns with a format
		const formattedColumns = this.columns.filter(column => column.add_sum);

		// update the summaries
		formattedColumns.forEach(column => {
			const { id, format } = column;
			const { locale, options } = format;
			const th = this.shadowRoot.querySelector(`#summary-${id}`);
			const sum = this.#getSum(column);
			th.innerHTML = new Intl.NumberFormat(locale, options).format(sum);
		});
	}

	/**
	 * Calculates the sum of the cells in a given column.
	 * 
	 * @param {Object} column - The column object containing the id.
	 * @returns {number} - The sum of the cells in the column.
	 */
	#getSum(column) {
		// get the column id
		const { id } = column;

		// get the cells in the column
		const cells = this.shadowRoot.querySelectorAll(`td[headers="label-${id}"]`);

		// get the sum of the cells
		const sum = Array.from(cells).reduce((acc, cell) => {
			let value = cell.innerHTML;
			// remove currency formatting
			value = value.replace(/[^0-9.-]+/g, '');
			return acc + parseFloat(value);
		}, 0);
		return sum;
	}

	#nextPage(event) {
		// get the next page of data from FileMaker
		console.log('next page');
		this.request = {
			...this.#lastRequest,
			offset: this.#lastRequest.offset + this.#lastRequest.limit
		}

		// disable the button if there are no more records
		if (this.#lastRequest.offset + this.#lastRequest.limit > this.totalRecordCount) {
			this.ids['next-button'].disabled = true;
			console.log('no more records');
		}

	}

	#prevPage() {
		// get the previous page of data from FileMaker
		console.log('prev page');
		this.request = {
			...this.#lastRequest,
			offset: this.#lastRequest.offset - this.#lastRequest.limit
		}

		// disable the button if there are no more records
		if (this.#lastRequest.offset - this.#lastRequest.limit < 1) {
			this.ids['prev-button'].disabled = true;
		}
	}

	#performFind() {
		// clone the request
		const request = { ...this.#firstRequest };
		// clone the query
		const query = [...request.query];
		// get the search inputs that have a value
		const inputs = this.shadowRoot.querySelectorAll('th input');

		// get the search type
		const type = this.findType;
		console.log('performing find')


		// loop through the inputs and add the search
		let termCount = 0;
		inputs.forEach(input => {
			// if (!input.value) {
			// 	return;
			// }
			termCount++;
			const id = input.id.replace('search-', '');
			const column = this.columns[id];
			const { item_field_name: fieldName } = column;
			const value = input.value;
			if (type === 'OR') {
				query.push({ [fieldName]: value });
			} else if (type === 'AND') {
				query.forEach((q, index) => {
					query[index][fieldName] = value;
				});
			}
		})

		// if all inputs are empty, reset the query
		if (termCount === 0) {
			console.log('performing initial request', this.#firstRequest)
			// clone the first request
			this.request = { ...this.#firstRequest };
			return;
		}

		// set the new request
		this.request = {
			...this.#firstRequest,
			query,

		}


	}

	/**
	 * Handles the click event for adding an item to the cart.
	 * emits an add-to-cart event for the parent component to handle.
	 * 
	 * @param {Event} event - The click event object.
	 */
	#handleClickAddToCart(event) {
		// get the data from the row
		const row = event.target.closest('tr'); // the row
		const td = event.target.closest('td'); // the cell
		const column = this.columns[td.cellIndex]; // the column

		const { cart_ids: cartIds } = column;

		// create the event
		const e = new CustomEvent('add-to-cart', {
			bubbles: true,
			composed: true,
			detail: {
				row: row,
				cartIds,
			}
		});


		// dispatch the event
		this.dispatchEvent(e);

	}

}

customElements.define('fm-results-list', FmResultsList);

export default FmResultsList;