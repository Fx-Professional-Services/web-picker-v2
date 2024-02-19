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
		item_field_name: 'item__PRICE__list::amount',
		editable: true,
		input_attributes: {
			min: 0,
			size: 10,
			step: 0.01,
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

const resultTemplate = {
	'order item::name': 'name',
	'order item::price': '`${vars.price}`',
	'order item::_order id': 'my order id',
	'order item::quantity': '`${vars.quantity}`',
	'order item::subtotal': '`${vars.quantity * vars.price}`',
	'order item::__id': '`${vars.id}`',
	'order item::week': '`${vars.week}`'
};

class FmCart2 extends FmComponent {
	// static methods
	static get observedAttributes() {
		return [''];
	}
	// static properties
	// private properties
	#columns =[];
	#rows = new Map();
	#title;

	// constructor
	constructor() {
		try {
			super();
			this.selectedIds = new Set();
			this.allowDuplicates = true;

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
			
				// set colspan of titleCell and buttonsCell
				this.ids['title-cell'].colSpan = this.columns?.length + 1 || 1;
				;
				this.ids['buttons-cell'].colSpan = this.columns?.length + 1 || 1;
		

			// add event listeners
			this.ids['cancel-button'].addEventListener(
				'click',
				this.#handleClickCancel.bind(this),
			);

			this.ids['done-button'].addEventListener(
				'click',
				this.#handleClickDone.bind(this),
			);

			this.isAttached = true;

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

			console.log('rendering cart');
			this.isRendered = true;

			// add columns
			this.#addColumns();
			this.#addSummaryRow();

		} catch (error) {
			throw error;
		}
	}

	/* getters */
	get template() {
		return /*html*/ `
		<table>
			<thead>
				<tr id='title-row'><th id='title-cell'>${this.cartTitle}</th></tr>
				<tr id='header-row'></tr>
			</thead>
			<tbody>
			</tbody>
			<tfoot>
				<tr id='summary-row'></tr>
				<tr id='bottom-buttons-row'>
					<td id='buttons-cell'>
						<picker-button id='cancel-button'>Cancel</picker-button>
						<picker-button id='done-button'>Done</picker-button>
					</td>
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
				border: 1px solid #ccc;
			}

			input {
				width: 100%;
				padding: 4px;
				box-sizing: border-box;

			}

			input[type=number] {
				text-align: right;
				border: 1px solid #ccc;

			}

			thead tr {
				background-color: #f2f2f2;
			}

			thead th {
				padding: 4px;
				text-align: left;
				font-weight: bold;
				font-size: 1em;
			}

			tbody tr:nth-child(even) {
				background-color: #f9f9f9;
			}

			tbody td {
				padding: 4px;
				box-sizing: border-box;
				font-size: 1em;
				margin: 0 -1px -1px 0;
			}

			tr {
			}

			tfoot tr {
				background-color: #f2f2f2;
			}

			tfoot td {
				padding: 4px;
				text-align: right;
			}

			.input-cell {
				padding: 0;

			}

			.input-cell * {
				width: 100%;
				box-sizing: border-box;
				border-radius: 0;
				border-collapse: collapse;
				margin: 0 -1px -1px 0;
			}

			.delete-button {
				padding: 4px 8px;
				background-color: #dc3545;
				color: #fff;
				border: none;
				border-radius: 0;
				cursor: pointer;
				box-sizing: border-box;
				height: 100%;
				width: 100%;
			}

			input:active, input:focus {
				outline: none;
				border: 1px solid #007bff;
			}

			input {
				border: 1px solid #ccc;
				font-size: 1em;
			}

			#buttons-cell {
				text-align: right;
			}


		`;
	}

	get columns() {
		return this.#columns;
	}

	get cartTitle() {
		return this.#title;
	}

	/* setters */
	set columns(columns) {
		this.#columns = columns;

		if (!this.isRendered) {
			console.log('not rendered');
			return;
		}

		this.#addColumns();
		this.#addSummaryRow();

		if (this.isAttached) {
			// set colspan of titleCell and buttonsCell
			this.titleCell.colSpan = this.columns?.length + 1 || 1;
			;
			this.buttonsCell.colSpan = this.columns?.length + 1 || 1;
		}
	}

	set cartTitle(title) {
		this.#title = title;

		if (!this.isRendered) {
			console.log('not rendered');
			return;
		}

		this.render();
	}

	/* private methods */
	#addColumns() {
		try {
			if (!this.isRendered) {
				console.log('not rendered, cannot add columns');
				return;
			}

			if (!this.columns) {
				console.log('no columns');
				return;				
			}

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

			if (this.selectedIds.has(resultRow.recordId) && !this.allowDuplicates) { 
				return;
			}

			// add the id to the set
			this.selectedIds.add(resultRow.recordId);

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

			this.columns.forEach((column) => {
				// add cell
				// this will also update the vars object
				const td = this.#addCell(row, column);
				row.append(td);
			});

			// add event listener
			row.addEventListener(
				'variable-changed',
				this.#handleVariableChanged.bind(this),
			);

			// update expressions
			this.#updateExpressionCells(row);

			// add delete button
			const deleteButton = document.createElement('button');
			deleteButton.textContent = 'delete';
			deleteButton.classList.add('delete-button');
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
			tbody.append(row);

			return row;
		} catch (error) {
			throw error;
		}
	}

	#addCell(row, column) {
		try {
			// deconstruct column
			const {
				name,
				type,
				input_attributes,
				editable,
				var_name: varName,
				expression,
				id: columnId,
				default_value: defaultValue,
			} = column;

			// create td element
			const td = document.createElement('td');

			// associate the column
			td.column = column;
			td.headers = `col-${columnId}`;

			// get the value
			const value =
				this.#getValue(row.vars, column, row.record) || defaultValue;

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
					input.addEventListener(
						'input',
						this.#emitVariableChanged.bind(this),
					);
				}

				// get the value
				input.value = value;

				// add class to td
				td.classList.add('input-cell');

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
			const summaryRow = this.ids['summary-row'];
			this.columns.forEach((column, index) => {
				const td = document.createElement('td');
				const { summary_format: format, id } = column;
				td.id = `summary-col-${id}`;
				td.headers = `col-${id}`;
				if (column.add_sum) {
					td.classList.add('sum');
					td.textContent = new Intl.NumberFormat(
						format.locale || null,
						format.options,
					).format(0);
				}

				summaryRow.append(td);
			});

			// add delete column
			const td = document.createElement('td');
			td.textContent = '';
			summaryRow.appendChild(td);
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
			const value = eval(expression);

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
			if (td.column.add_sum) {
				this.#updateSummary(td.column);
			}
		});
	}

	#updateSummary(column) {
		try {
			// destructure column
			const {
				var_name: varName,
				summary_format: summaryFormat,
				id,
			} = column;

			// get all body cells for this column
			const cells = this.shadowRoot.querySelectorAll(
				`tbody td[headers='col-${id}']`,
			);

			// get the sum
			const sum = Array.from(cells).reduce((acc, cell) => {
				let value =
					cell.querySelector('input')?.value || cell.textContent || 0;
				// remove currency symbols
				value = value.replace(/[$,]/g, '');
				// remove non-numeric characters
				value = value.replace(/[^\d.-]/g, '') || 0;
				return acc + parseFloat(value);
			}, 0);

			// format the sum
			const formattedSum = sum.toLocaleString(
				summaryFormat.locale,
				summaryFormat.options,
			);

			// update the summary cell
			const summaryCell = this.shadowRoot.getElementById(
				`summary-col-${id}`,
			);
			summaryCell.textContent = formattedSum;
		} catch (error) { }
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
				if (row) {
					this.#rows.set(row.id, row);
				}
			});

			// update the summaries
			this.#updateAllSummaries();
		} catch (error) {
			throw error;
		}
	}

	getResults() {
		const results = [];
		this.#rows.forEach((row) => {
			const result = {};
			const data = row.record;
			const vars = row.vars;
			Object.entries(this.resultTemplate).forEach(([key, value]) => {

				if (value.startsWith('`')) {
					// if the value is a template string, evaluate it
					value = eval(value);
				} else if (data[value]) {
					// if the value is a field name, get the value from the data object
					value = data[value];
				} else {
					// return the literal value
					value = value;
				}

				result[key] = value;

			})
			results.push(result);
		});

		return results;
	}

	/* handlers */

	#handleClickCancel(event) {
		console.log('cancel button clicked');
	}

	#handleClickDone(event) { }

	#emitVariableChanged(event) {
		// get the tr (target closest tr if the event target is an input element)
		const tr =
			event.target.closest('tr') || event.target.parentElement;
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
		if (column.add_sum) {
			this.#updateSummary(column);
		}
	}
}

customElements.define('fm-cart', FmCart2);
