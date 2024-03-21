import FMComponent from 'https://github.com/Fx-Professional-Services/web-picker-v2/blob/main/components/FmComponent.js';

class FmCart extends FmComponent {
	// static methods
	static get observedAttributes() {
		return [''];
	}
	// static properties
	// private properties
	#columns =[];
	#rows = new Map();
	#title;
	#summariesExceeded = new Set();
	#summariesUnderMinimum = new Set();

	// constructor
	constructor() {
		try {
			super();
			this.selectedIds = new Set();
			this.maxSelections = Infinity;
			this.idKeyName;

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
					</td>
					</tr>
			</tfoot>
		</table>
		`;
	}

	get styles() {
		return /*css*/ `

		.max-sum-exceeded {
			color: red;
		}

		.min-sum-under {
			color: orange;
		}

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

	set rows(rows) {
		// get tbody
		const tbody = this.shadowRoot.querySelector('tbody');

		// clear the tbody
		tbody.replaceChildren();
		this.addItems(rows);
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

			// add an id to the resultRow if it's missing.
			// this is to allow for developers to send rows
			// that are not in the database
			if (!resultRow.recordId) {
				console.log('no record id for item in cart');
				resultRow.recordId = resultRow.record.fieldData[this.idKeyName] ||
					resultRow.record[this.idKeyName] ||
					null;

			}

			if (!resultRow.recordId) {
				console.error('no record id for item in cart', resultRow.recordId, resultRow.record.fieldData, resultRow.record);
				return;
			}

			if (!resultRow.vars) {
				resultRow.vars = {};
			}

			resultRow.vars.recordId = crypto.randomUUID();

			// check if the id is already in the set
			if (this.selectedIds.has(resultRow.recordId) && !this.allowDuplicates) { 
				return;
			}

			if (this.selectedIds.size >= this.maxSelections) {
				const error = new Error('Maximum selections reached.');
				alert(error.message);
				throw error;
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
			deleteButton.addEventListener('click', (event) => {
				// get the row
				const tr = event.target.closest('tr');
				this.#deleteRow(tr);
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
						// if the value is a string that matches a field in the record, use that value
						// commmenting this out for now, will test later. 
						// not currently a needed feature.

						// if (row.record.fieldData[value]) {
						// 	console.log('value is a field in the record', value, row.record.fieldData[value])
						// 	value = row.record.fieldData[value];
						// }
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
				if (column.add_sum && format) {
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
			let value = itemFieldName?.includes('::') ? fieldData[itemFieldName] : '';

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
				max_sum: maxSum,
				min_sum: minSum,
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

			// update the summary cell
			const summaryCell = this.shadowRoot.getElementById(
				`summary-col-${id}`,
			);

			// check if the sum exceeds the max_sum
			if (maxSum && sum > maxSum) {
				// add a class to the summary cell
				summaryCell.classList.add('max-sum-exceeded');
				// add property to the column
				this.#summariesExceeded.add(column);
			} else if (summaryCell.classList.contains('max-sum-exceeded')) {
				// remove the class
				summaryCell.classList.remove('max-sum-exceeded');
				// remove property from the column
				this.#summariesExceeded.delete(column);
			}

			if (minSum && sum < minSum) {
				console.log('sum is under minimum', column);
				this.#summariesUnderMinimum.add(column);
				summaryCell.classList.add('min-sum-under');
			} else if (summaryCell.classList.contains('min-sum-under')) { 
				summaryCell.classList.remove('min-sum-under');
				this.#summariesUnderMinimum.delete(column);
			}

			// format the sum
			const formattedSum = sum.toLocaleString(
				summaryFormat.locale,
				summaryFormat.options,
			);


			summaryCell.textContent = formattedSum;

			return {
				varName,
				sum,
				formattedSum,
			};

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

	#deleteRow(row) {
		// remove the row
		row.remove();
		// remove from rows map
		this.#rows.delete(row.id);
		// update the summaries
		this.#updateAllSummaries();
		// remove the id from the set
		this.selectedIds.delete(row.recordId);
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

		// check for exceeded summaries
		if (this.#summariesExceeded.size > 0) {
			let errorMessage = 'The following summaries have exceeded their maximum value:\n';
			this.#summariesExceeded.forEach((column) => { 
				errorMessage += `${column.name} exceeds ${column.max_sum}.\n`;
			});	

			// alert the user
			const error = new Error(errorMessage);
			alert(error.message);
			throw error;
		}

		// check for under minimum summaries
		if (this.#summariesUnderMinimum.size > 0) {
			let errorMessage = 'The following summaries are under their minimum value:\n';
			this.#summariesUnderMinimum.forEach((column) => { 
				errorMessage += `${column.name} is under ${column.min_sum}.\n`;
			});	

			// alert the user
			const error = new Error(errorMessage);
			alert(error.message);
			throw error;
		}

		const results = [];

		this.#rows.forEach((row) => {
			const result = {};
			const data = row.record.fieldData;
			const vars = row.vars;

			Object.entries(this.resultTemplate).forEach(([key, value]) => {

				if (!value) {
					result[key] = '';
				} else if (typeof value === 'boolean') {
					// if it's a boolean 
					result[key] = value;
				} else if (value.startsWith('`') && value.endsWith('`')) {
					// if the value is a template string, evaluate it
					result[key] = eval(value);
				} else if (value.includes('::') && data[value]) {
					// if the value is a fully qualified field name, get the value from the data object
					result[key] = data[value]
				} else if (value.includes('::') && !data[value]) {
					// do nothing, don't add it to the result
					// we dont' want to clear the value if it's not in the data object
				} else {
					// return the literal value
					result[key] = value;
				}

			})
			results.push(result);
		});

		return results;
	}

	/* handlers */

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

customElements.define('fm-cart', FmCart);


// export default FmCart;