class FmResultsList {

	#queryResponse
	#firstRequest
	#requestScriptName = 'sub: query and callback (web picker v2)'
	#request

	constructor(parentElement, columns, request) {
		try {
			// set properties
			this.columns = columns
			this.records = [] 
			this.searchFields = []
			this.searchFieldsQuery = {}
			this.timeout = null

			this.totalRecordCount = 0
			this.foundCount = 0

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
			this.#queryResponse = response
			const { data } = response
			this.records = data

			// update totalRecordCount and foundCount
			this.totalRecordCount = response.dataInfo.totalRecordCount
			this.foundCount = response.dataInfo.foundCount

			// delete existing rows
			while (this.body.firstChild) {
				this.body.removeChild(this.body.firstChild)
			}

			// draw the rows
			this.#drawRows(this.body, this.columns, data)
			return this

		} catch (error) {
			throw error;
		}
	}

	set request(request) {
		try {

			if (!this.#firstRequest) {
					// save first request
				this.#firstRequest = JSON.parse(JSON.stringify(request));
			}

			// clone request
			this.#request = JSON.parse(JSON.stringify(request))

			// initialize these, they'll change when we paginate 
			this.limit = request.limit || 100
			this.offset = request.offset || 1
			this.query = request.query || []
			// data will be returned using a callback function

			// enable/disable next/previous buttons
			if (this.offset <= 1) {
				this.previousButton.disabled = true
			} else {
				this.previousButton.disabled = false
			}

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

	get firstRequest() {
		return this.#firstRequest
	}

	// METHODS
	requestData() {
		try {

			if (!this.#request) {
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

			// create labels row
			const row = document.createElement('tr')

			// create search fields row
			const searchRow = document.createElement('tr')

			// add class
			searchRow.classList.add('search-fields')

			header.appendChild(searchRow)
			header.appendChild(row)

			columns.forEach((column, i) => {
				const { name, type, item_field_name, format, searchable } = column
				const th = document.createElement('th')
				row.appendChild(th)

				// add class to last column
				if (i === columns.length - 1) {
					th.classList.add('last-column')
				}

				// create label
				th.textContent = name.toString() || ''
				th.dataset.type = type.toString() || ''
				if (item_field_name) {
					th.dataset.item_field_name = item_field_name.toString() || ''
				}

				if (format) {
					th.dataset.format = format.toString()
				}

				// create th for search field
				const searchTh = document.createElement('th')
				searchRow.appendChild(searchTh)

				// append input if searchable
				if (searchable) {
					// create input
					const input = document.createElement('input')
					input.type = 'text'
					input.placeholder = 'Search'
					input.dataset.item_field_name = item_field_name.toString() || ''
					searchTh.appendChild(input)

					// add handlers
					input.addEventListener('input', this.#inputHandler.bind(this))
					input.addEventListener('keyup', this.#keyUpHandler.bind(this))


					// add to searchFields property
					this.searchFields.push(input)
				}

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

			// create next/prev buttons
			const nextButton = this.#createNextButton()
			const previousButton = this.#createPreviousButton()

			// save to private properties
			this.nextButton = nextButton
			this.previousButton = previousButton


			// add button to row
			row.appendChild(previousButton)
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

	#createPreviousButton() {
		try {
			const button = document.createElement('button')
			button.textContent = 'Previous'
			button.addEventListener('click', () => {
				this.#previousPage()
			})
			return button
		} catch (error) {
			throw error
		}
	}

	#nextPage() {
		try {


			let { limit, offset } = this

			// increment offset
			offset += limit 

			const request = {
				...this.request,
				limit,
				offset,
			}

			this.request = request


			// request data from FileMaker
			this.requestData()

		} catch (error) {
			throw error
		}
	}

	#previousPage() {
		try {

			let { limit, offset } = this

			// decrement offset
			offset -= limit

			const request = {
				...this.request,
				limit,
				offset,
			}

			// if offset is 0 or less, set to 1
			// also disable previous button
			if (offset <= 0) { 
				request.offset = 1
			}

			this.request = request


			// request data from FileMaker
			this.requestData()

			// // redraw the table
			// this.requestData()

		} catch (error) {
			throw error
		}
	}

	#calculateNewRequest(columns, request, searchFieldsQuery) {
		try {

			// reset offset
			request.offset = 1

			// build query
			const newQuery = []

			if (request.query?.length > 0) {
							// loop through query
				request.query.forEach(query => {

					if (!query.omit) {
					 
						// merge query with searchFieldsQuery
						const mergedQuery = {
							...searchFieldsQuery,
							...query,
						}
						// add to newQuery
						newQuery.push(mergedQuery)

					} else if (query.omit) {
						// leave it unchanged and add this as a new query
						newQuery.push(query, searchFieldsQuery)
					}
					
				})
			} else if ( Object.keys(searchFieldsQuery).length > 0) {
				// if searchFieldsQuery has values...
				newQuery.push(searchFieldsQuery)
			} 


			// update request
			if (newQuery.length > 0) {
				request.query = newQuery
			} else {
				request = this.firstRequest
			}
			// request.query = newQuery

			return request

		} catch (error) {
			throw error
		}
	}

	#inputHandler(event) {
		try {

			// clear timeout
			clearTimeout(this.timeout)

			// are we getting correct values for searchFieldsQuery and firstRequest?

			// set timeout
			this.timeout = setTimeout((searchFieldsQuery, firstRequest) => {

				// get new request after timeout
				const newRequest = this.#calculateNewRequest(this.columns, firstRequest, searchFieldsQuery)

				this.request = newRequest

				// request data from FileMaker
				this.requestData()

			}, 1000, this.searchFieldsQuery, JSON.parse(JSON.stringify(this.firstRequest)))

			// calculate new request
			//  const newRequest = this.#calculateNewRequest(this.columns, this.request, this.searchFields)

		} catch (error) {
			throw error
		}
	}

	#keyUpHandler(event) {
		try {
			const value = event.target.value

			// get item_field_name
			const item_field_name = event.target.dataset.item_field_name

			// update searchFieldsQuery
			if(value === '') {
				delete this.searchFieldsQuery[item_field_name]
			} else {
				this.searchFieldsQuery[item_field_name] = value
			}

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


