// test data
const resultColumns = [
	{
		name: 'ID', type: 'number', item_field_name: 'id', searchable: true, add_sum: true,
		format: {
			locale: 'en-US',
			options: {
				style: 'decimal'
			}
		
		}
},
	{ name: 'Name', type: 'text', item_field_name: 'name', searchable: true },
	{
		name: 'Price', type: 'number', item_field_name: 'item__PRICE__list::amount', searchable: true, add_sum: true,
		// include options for Intl.NumberFormat
		format: {
			locale: 'en-US',
			options: {
				style: 'currency',
				currency: 'USD'
			}
		}
	},
	{
		cart_ids: ["cart-1"],
		name: "cart 1",
		type: "cart-button"
	}, {
		cart_ids: ["cart-2"],
		name: "cart 2",
		type: "cart-button"
	}
]

const testResponse = {
	"response": {
		"dataInfo": {
			"database": "ProductDB",
			"layout": "ProductLayout",
			"table": "ProductTable",
			"totalRecordCount": 10,
			"foundCount": 10,
			"returnedCount": 10
		},
		"data": [
			{
				"fieldData": {
					"id": 1,
					"name": "Product A",
					"description": "This is product A",
					"price": 29.99,
					"stock": 100
				},
				"modId": "0",
				"recordId": "1001",
				"portalData": {}
			},
			{
				"fieldData": {
					"id": 2,
					"name": "Product B",
					"description": "This is product B",
					"price": 39.99,
					"stock": 200
				},
				"modId": "1",
				"recordId": "1002",
				"portalData": {}
			},
			{
				"fieldData": {
					"id": 3,
					"name": "Product C",
					"description": "This is product C",
					"price": 49.99,
					"stock": 150
				},
				"modId": "2",
				"recordId": "1003",
				"portalData": {}
			}
		]
	}
};

class FmResultsList2 extends FmComponent {
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
		:host {
			display: block;
		}

		table {
			width: 100%;
			border-collapse: collapse;
		}

		thead {
			background-color: #f2f2f2;
		}

		tbody {
			background-color: #ffffff;
		}

		tfoot {
			background-color: #f2f2f2;
		}

		#title-row {
			background-color: #e6e6e6;
			font-weight: bold;
			text-align: center;
		}

		#label-row {
			background-color: #f2f2f2;
			font-weight: bold;
		}

		#summary-row {
			background-color: #e6e6e6;
			font-weight: bold;
		}

		#buttons-row {
			background-color: #f2f2f2;
			font-weight: bold;
		}

		#search-row {
			background-color: #f2f2f2;
		}

		th {
			border: 1px solid #dddddd;
			text-align: left;
			padding: 5px;
		}

		td {
			border: 1px solid #dddddd;
			text-align: left;
			padding: 5px;
		}

		tr:nth-child(even) {
			background-color: #f2f2f2;
		}

		tr:nth-child(odd) {
			background-color: #ffffff;
		}

		tr:hover {
			background-color: #f2f2f2;
		}

		#buttons-cell {
			
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
		this.#lastRequest = request;

		if (!this.#firstRequest) {
			// save the first request for reference
			this.#firstRequest = request;
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

		const titleCell = this.shadowRoot.querySelector('#title-row td');
		const buttonsCell = this.shadowRoot.querySelector('#buttons-cell');
		titleCell.colSpan = this.columns.length;
		buttonsCell.colSpan = this.columns.length;

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
				input.type = type;
				input.id = `search-${id}`;
				input.placeholder = `Search ${name}`;
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
		const recordId = record[this.idKeyName];

		// add a uuid for the row
		tr.id = crypto.randomUUID();

		// add the record id, fallback to the row id
		tr.recordId = recordId || tr.id;

		// add a vars object
		tr.vars = {};

		// add the record id to the vars object
		tr.vars.id = tr.recordId;

		// add the cells to the row
		this.columns.forEach(column => {
			const td = this.#addCell(column, record, tr);
			tr.appendChild(td);
		});

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

customElements.define('fm-results-list', FmResultsList2);
