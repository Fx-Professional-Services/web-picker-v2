class FmResultsList {

	#queryResponse
	#request
	#requestScriptName = 'sub: query and callback (web picker v2)'

	constructor(parentElement, columns, request) {
		try {
			// set properties
			this.columns = columns
			this.records = []

			// draw the table
			this.table = this.#drawTable(parentElement, columns)
			this.body = this.table.querySelector('tbody')
			this.footer = this.#createFooter()

			// add footer 
			this.table.appendChild(this.footer)

			// set request
			if (request) {
				this.request = request
			}

			return this;

		} catch (error) {
			throw error
		}
	}

	// SETTERS
	set queryResponse(response) {
		try {
			console.log('queryResponse', response)
			this.#queryResponse = response
			const { data } = response
			this.records = data

			// draw the rows
			this.#drawRows(this.body, this.columns, data)
			return this

		} catch (error) {
			throw error;
		}
	}

	set request(request) {
		try {


			this.#request = request

			// initialize these, they'll change when we paginate 
			this.limit = request.limit || 100
			this.offset = request.offset || 0
			this.query = request.query || []
			// data will be returned using a callback function

		} catch (error) {
			throw error;
		}


	}

	// GETTERS
	get queryResponse() {
		return this.#queryResponse
	}

	get request() {
		return this.#request
	}

	// METHODS
	requestData() {
		try {

			if (!this.request) {
				throw new Error('requestData: request is required')
			}
			// request data from FileMaker
			this.#requestData(this.request)

		} catch (error) {
			throw error
		}
	}

	// PRIVATE METHODS
	// draw the table
	#drawTable(parentElement, columns = this.columns) {
		try {
			// create table
			const table = document.createElement('table')
			table.classList.add('fm-results-list', 'styled-table')

			// create body
			const body = document.createElement('tbody')

			// create header
			const header = this.#createHeader(columns)

			// add header to table
			table.appendChild(header)

			// add body to table
			table.appendChild(body)

			// add table to parent
			parentElement.appendChild(table)

			return table

		} catch (error) {
			throw error
		}
	}

	// create the header
	#createHeader(columns) {
		try {
			const header = document.createElement('thead')
			const row = document.createElement('tr')
			header.appendChild(row)

			columns.forEach(column => {
				const { name, type, item_field_name, format } = column
				const th = document.createElement('th')
				th.textContent = name.toString() || ''
				th.dataset.type = type.toString() || ''
				if (item_field_name) {
					th.dataset.item_field_name = item_field_name.toString() || ''
				}

				if (format) {
					th.dataset.format = format.toString()
				}

				row.appendChild(th)
			})
			return header
		} catch (error) {
			throw error
		}
	}

	// create a single result row
	#createRow(columns, record) {
		try {
			const row = document.createElement('tr')

			// add data to row
			row.data = record

			// get fieldData
			const { fieldData, recordId } = record

			row.id = recordId

			columns.forEach(column => {
				const { type, item_field_name, format } = column
				const td = document.createElement('td')

				// get value, the key name may have spaces
				const value = fieldData[item_field_name]
				td.textContent = value
				td.dataset.type = type.toString() || ''

				if (item_field_name) {
					td.dataset.item_field_name = item_field_name.toString() || ''
				} else if (type == 'cart-button') {
					// get the carts array 
					const cart_ids = column.cart_ids

					// loop through the carts array
					cart_ids.forEach(cart_id => {
						// create button
						const button = document.createElement('button')
						button.textContent = 'Add'
						td.appendChild(button)

						// add event listener
						// event listener should find cart by id
						// then call the addItem() method
						button.addEventListener('click', () => {
							// const cart = document.querySelector(`#${cart_id}`)
							console.log(window.cart)
							window[cart_id].addItem(fieldData)
						})
					})

				}

				if (format) {
					td.dataset.format = format.toString()
				}
				row.appendChild(td)
			})
			return row
		} catch (error) {
			throw error;
		}
	}

	// create rows and append to table
	#drawRows(table, columns, records) {
		try {
			records.forEach(record => {
				// create row
				const row = this.#createRow(columns, record)
				// add row to table
				table.appendChild(row)
			})
		} catch (error) {
			throw error
		}
	}

	#createFooter() {
		try {
			const footer = document.createElement('tfoot')
			const row = document.createElement('tr')

			// create next button
			const nextButton = this.#createNextButton()

			// add button to row
			row.appendChild(nextButton)

			footer.appendChild(row)
			return footer
		} catch (error) {
			throw error
		}
	}

	#requestData(request) {
		try {
			// request data from FileMaker
			FileMaker.PerformScriptWithOption(
				this.#requestScriptName,
				JSON.stringify(request),
				"5"
			)
		} catch (error) {
			throw error;
		}
	}

	#createNextButton() {
		try {
			const button = document.createElement('button')
			button.textContent = 'Next'
			button.addEventListener('click', () => {
				this.#nextPage()
			})
			return button
		} catch (error) {
			throw error
		}
	}

	#nextPage() {
		try {

			console.log('nextPage')

			let { limit, offset } = this

			// increment offset
			offset += limit

			const request = {
				...this.request,
				limit,
				offset,
			}

			this.request = request

			console.log('request', request)

			// request data from FileMaker
			this.requestData()

			// // redraw the table
			// this.requestData()

		} catch (error) {
			throw error
		}
	}

}

// sample FileMaker data
// const testData = {
// 	"response": {
// 		"dataInfo": {
// 			"database": "ExampleDB",
// 			"layout": "ExampleLayout",
// 			"table": "ExampleTable",
// 			"totalRecordCount": 10,
// 			"foundCount": 10,
// 			"returnedCount": 10
// 		},
// 		"data": [
// 			{ "fieldData": { "id": 1, "name": "John", "age": 30 }, "modId": "0", "recordId": "1001", "portalData": {} },
// 			{ "fieldData": { "id": 2, "name": "Jane", "age": 25 }, "modId": "1", "recordId": "1002", "portalData": {} },
// 			{ "fieldData": { "id": 3, "name": "Bob", "age": 35 }, "modId": "2", "recordId": "1003", "portalData": {} },
// 			{ "fieldData": { "id": 4, "name": "Alice", "age": 28 }, "modId": "3", "recordId": "1004", "portalData": {} },
// 			{ "fieldData": { "id": 5, "name": "Charlie", "age": 32 }, "modId": "4", "recordId": "1005", "portalData": {} },
// 			{ "fieldData": { "id": 6, "name": "Eve", "age": 33 }, "modId": "5", "recordId": "1006", "portalData": {} },
// 			{ "fieldData": { "id": 7, "name": "Frank", "age": 29 }, "modId": "6", "recordId": "1007", "portalData": {} },
// 			{ "fieldData": { "id": 8, "name": "Grace", "age": 31 }, "modId": "7", "recordId": "1008", "portalData": {} },
// 			{ "fieldData": { "id": 9, "name": "Heidi", "age": 27 }, "modId": "8", "recordId": "1009", "portalData": {} },
// 			{ "fieldData": { "id": 10, "name": "Ivan", "age": 34 }, "modId": "9", "recordId": "1010", "portalData": {} }
// 		]
// 	}
// }



// const testColumns = [
// 	{ name: 'ID', type: 'number', item_field_name: 'id', },
// 	{ name: 'Name', type: 'text', item_field_name: 'name', },
// 	{ name: 'Age', type: 'number', item_field_name: 'age', },
// ]


