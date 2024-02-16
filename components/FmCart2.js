// test data
const cartColumns = [
	{
		name: 'Name',
		type: 'text',
		item_field_name: 'name',
		editable: false,
		format: 'string',
	},
	{
		name: 'Price',
		type: 'number',
		item_field_name: 'price',
		editable: true,
		input_attributes: {
			min: 0,
			size: 10,
			step: 1,
			maxLength: 10,
		},
		format: 'currency',
		var_name: 'price',
		add_sum: true,
		summary_format: {
			locale: 'en-US',
			options: {
				style: 'currency',
				currency: 'USD',
			},
		},
	},
	{
		name: 'Quantity (max 10)',
		type: 'number',
		item_field_name: 'quantity',
		editable: true,
		input_attributes: {
			min: 1,
			max: 10,
			maxLength: 3,
			size: 3,
		},
		var_name: 'quantity',
		default_value: 1,
		add_sum: true,
		max_sum: 10,
		summary_format: {
			locale: 'en-US',
			options: { style: 'decimal', currency: 'USD' },
		},
	},
	{
		name: 'Subtotal',
		type: 'expression',
		item_field_name: 'subtotal',
		editable: true,
		summary_format: {
			locale: 'en-US',
			options: { style: 'currency', currency: 'USD' },
		},
		var_name: 'subtotal',
		expression: '`$${(vars.quantity * vars.price).toFixed(2)}`',
		add_sum: true,
		max_sum: 1000,
	},
];

class FmCart2 extends FmComponent {
	// static methods
	static get observedAttributes() {
		return [''];
	}
	// static properties
	// private properties
	#columns;
	#rows = new Map();

	// constructor
	constructor() {
		try {
			super();
			this.columns = cartColumns;

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
			// public properties
			this.headerRow = this.shadowRoot.getElementById('header-row');
			this.summaryRow = this.shadowRoot.getElementById('summary-row');
			this.bottomButtonsRow = this.shadowRoot.getElementById(
				'bottom-buttons-row',
			);
			this.cancelButton =
				this.shadowRoot.getElementById('cancel-button');
			this.doneButton = this.shadowRoot.getElementById('done-button');

			// add event listeners
			this.cancelButton.addEventListener(
				'click',
				this.#handleClickCancel.bind(this),
			);

			this.doneButton.addEventListener(
				'click',
				this.#handleClickDone.bind(this),
			);
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

			// set the columns
			if (this.columns) {
				this.#addColumns();
				this.#addSummaryRow();
			}
		} catch (error) {
			throw error;
		}
	}

	/* getters */
	get template() {
		return /*html*/ `
		<table>
			<thead>
				<tr id='title-row'><td colspan='100%' id='title-cell'>Table Title</td></tr>
				<tr id='header-row'></tr>
			</thead>
			<tbody>
			</tbody>
			<tfoot>
				<tr id='summary-row'></tr>
				<tr id='bottom-buttons-row'>
					<td colspan='50%'><button id='cancel-button'>Cancel</button></td>
					<td colspan='50%'><button id='done-button'>Done</button></td>
					</tr>
			</tfoot>
		</table>
		`;
	}

	get styles() {
		return /*css*/ `
		table {
			width: 100%;
			border-collapse: collapse;
			margin: 0;
			padding: 0;

		}

		#title-row {
			background-color: #f0f0f0;
			border: 1px solid #dddddd;
			padding: 5px;
			font-size: 1em;
		}

		#title-cell {
			font-size: 1em;
			font-weight: bold;

		}

		#header-row {
			background-color: #f0f0f0;
			border: 1px solid #dddddd;
		}

		#header-row th {
			padding: 5px;
			border: 1px solid #dddddd;
			text-align: left;
		}

		#summary-row {
			background-color: #f0f0f0;

		}

		#summary-row td {
			padding: 5px;
			border: 1px solid #dddddd;
			text-align: left;
		}

		#bottom-buttons-row {
			background-color: #f0f0f0;

		}

		#bottom-buttons-row td {
			padding: 5px;
			border: 1px solid #dddddd;
			text-align: left;

		}

		#bottom-buttons-row button {
			width: 100%;
		}

		td {
			border: 1px solid #dddddd;
			padding: 5px;
		}


		`;
	}

	get columns() {
		return this.#columns;
	}

	/* setters */
	set columns(columns) {

		this.#columns = columns;
		if (!this.isRendered) {
			return;
		}

		this.#addColumns();
		this.#addSummaryRow();
	}

	/* private methods */
	#addColumns() {
		try {
			// get header row
			const headerRow = this.shadowRoot.getElementById('header-row');

			this.#columns.forEach((column, index) => {
				// create th element
				const th = document.createElement('th');

				// deconstruct column
				const { name } = column;

				// set text content
				th.textContent = name;

				// set the id
				th.id = `col-${index}`;

				// add id to this.columns
				column.id = index;

				headerRow.append(th);
			});

			// add delete column
			const th = document.createElement('th');
			th.innerHTML = 'Delete';
			th.id = `label-delete`;
			headerRow.appendChild(th);


		} catch (error) {
			throw error;
		}
	}

	#addRow(resultRow) {
		try {

			// get tbody
			const tbody = this.shadowRoot.querySelector('tbody');

			// create tr element
			const row = document.createElement('tr');

			// set a NEW row id to avoid collision
			row.id = crypto.randomUUID();

			// copy from resultRow
			row.vars = resultRow.vars || {};
			row.recordId = resultRow.recordId;
			row.record = resultRow.record;
			row.expressionCells = [];
			row.columns = this.columns;

			// add id to row (offers a unique identifier for the row)
			row.vars.rowId = row.id;


			this.columns.forEach((column) => {
				// add cell
				// this will also update the vars object
				const td = this.#addCell(row, column);
				row.append(td);
			});

			// add event listener
			row.addEventListener('variable-changed', this.#handleVariableChanged.bind(this));

			// update expressions
			this.#updateExpressionCells(row);

			// add delete button
			const deleteButton = document.createElement('button');
			deleteButton.textContent = 'Delete';
			deleteButton.addEventListener('click', () => {
				// remove the row
				row.remove();
				// remove from rows map
				this.#rows.delete(row.id);
				// update the summaries
				this.#updateAllSummaries();
			});

			// create td element
			const td = document.createElement('td');
			td.appendChild(deleteButton);
			row.appendChild(td);

			// append to tbody
			tbody.append(row)


			return row;
		} catch (error) {
			throw error;
		}
	}

	#addCell(row, column) {
		try {

			// deconstruct column
			const { name, type, input_attributes, editable, var_name: varName, expression, id: columnId } = column;

			// create td element
			const td = document.createElement('td');

			// associate the column
			td.column = column;
			td.headers = `col-${columnId}`;

			// get the value
			const value = this.#getValue(row.vars, column, row.record);

			// update vars object
			if (varName) {
				row.vars[varName] = value;
			}

			if (expression) {
				// add a class to the td so we can evaluate it later
				td.classList.add('expression');
				td.expression = expression;
				// add to array of expressions on the tr
				row.expressionCells.push(td);
			}

			// create input
			if (editable) {
				const input = document.createElement('input');
				input.type = type;

				// set input attributes
				if (input_attributes) {
					Object.entries(input_attributes).forEach(([key, value]) => {
						input.setAttribute(key, value);
					});
				}

				if (varName) {
					// add event listener
					input.addEventListener('input', this.#emitVariableChanged.bind(this));
				}


				// get the value
				input.value = value;

				// append input to td
				td.appendChild(input);
			} else {
				// set text content
				td.textContent = value;
			}

			// append to row
			row.appendChild(td);


			return td;
		} catch (error) {
			throw error;
		}
	}

	#addSummaryRow() {
		try {

			const summaryRow = this.shadowRoot.getElementById('summary-row');
			this.columns.forEach((column, index) => {
				const td = document.createElement('td');
				const { summary_format: format, id } = column;
				td.id = `summary-col-${id}`;
				td.headers = `col-${id}`;
				if (column.add_sum) {
					td.classList.add('sum');
					td.textContent = new Intl.NumberFormat(format.locale || null, format.options).format(0);
				}

				summaryRow.append(td);
			});


		} catch (error) {
			throw error;
		}
	}

	#getValue(vars, column, item) {
		try {

			// deconstruct column
			const { item_field_name: itemFieldName, expression } = column;
			const { fieldData } = item;

			// get value
			let value = fieldData[itemFieldName] || '';

			// if there is an expression, evaluate it
			if (expression) {
				value = eval(expression);
			}

			return value;

		} catch (error) {
			throw error;
		}

	}

	#updateExpressionCells(row) {
		const columns = this.columns;
		row.expressionCells.forEach((td) => {
			const vars = row.vars;
			const expression = td.expression;
			const value = eval(expression)

			// if the td has an input, update the input
			// if the td has text, update the text

			const element = td.querySelector('input') || td;
			if (element instanceof HTMLInputElement) {
				element.value = value;
			} else {
				element.textContent = value;
			}

			// update vars
			const varName = td.column.var_name;
			if (varName) {
				row.vars[varName] = value;
			}

			// update summaries
			if (td.column.add_sum) {5-1234
				this.#updateSummary(td.column);
			}
		});



	}

	#updateSummary(column) {
		try {
			// destructure column
			const { var_name: varName, summary_format: summaryFormat, id } = column;

			// get all body cells for this column
			const cells = this.shadowRoot.querySelectorAll(`tbody td[headers='col-${id}']`);

			// get the sum
			const sum = Array.from(cells).reduce((acc, cell) => {
				let value = cell.querySelector('input')?.value || cell.textContent || 0;
				// remove currency symbols
				value = value.replace(/[$,]/g, '');
				// remove non-numeric characters
				value = value.replace(/[^\d.-]/g, '') || 0;
				return acc + parseFloat(value);
			}, 0);

			// format the sum
			const formattedSum = sum.toLocaleString(summaryFormat.locale, summaryFormat.options);

			// update the summary cell
			const summaryCell = this.shadowRoot.getElementById(`summary-col-${id}`);
			summaryCell.textContent = formattedSum;

		} catch (error) {

		}
	}

	#updateAllSummaries() {
		this.columns.forEach((column) => {
			if (column.add_sum) {
				this.#updateSummary(column);
			}
		});
	
	}


	/* public methods */
	addItems(resultRows) {
		try {

			resultRows.forEach((resultRow) => { 
				// add the row
				const row = this.#addRow(resultRow);
				
				// add the row to the rows map
				this.#rows.set(row.id, row);

			});

			// update the summaries
			this.#updateAllSummaries();

		} catch (error) {
			throw error;
		}

	}

	/* handlers */

	#handleClickCancel(event) {
		console.log('cancel button clicked');
	}

	#handleClickDone(event) { }

	#emitVariableChanged(event) {

		// get the tr (target closest tr if the event target is an input element)
		const tr = event.target.closest('tr') || event.target.parentElement;
		const td = event.target.closest('td') || event.target;
		const column = this.columns[td.cellIndex];

		const VariableChangedEvent = new CustomEvent('variable-changed', {
			bubbles: true,

			detail: {
				row: tr,
				column: column,
				value: event.target.value,
			},
		});

		event.target.dispatchEvent(VariableChangedEvent);
	}

	#handleVariableChanged(event) {

		// deconstruct event
		const { row, column, value } = event.detail;

		// update the vars object
		row.vars[column.var_name] = value;

		// update the expression cells
		if (row.expressionCells.length > 0) {
			this.#updateExpressionCells(row);
		}

		// update the summary
		if(column.add_sum){
			this.#updateSummary(column);
		}

	}

}

customElements.define('fm-cart', FmCart2);
