// test data
const testCartColumns = [
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

const testResultTemplate = {
	'order item::name': 'name',
	'order item::price': '`${vars.price}`',
	'order item::_order id': 'my order id',
	'order item::quantity': '`${vars.quantity}`',
	'order item::subtotal': '`${vars.quantity * vars.price}`',
	'order item::__id': '`${vars.id}`',
	'order item::week': '`${vars.week}`'
};

const testCartOptions = {
	columns: testCartColumns,
	id_key_name: 'id',
	title: 'test cart',
	rows: [],
	template: testResultTemplate,
	cart_id: 'cart-1'
};

const testResultsListOptions = {
	columns: resultColumns,
	id_key_name: 'id',
	id: 'results-list-1',
	request: {
		layouts: "query: item v1",
		data_source_name: "order",
		limit: 10,
		query: [
			{
				['Item::is product']: "1"
			}
		]
	}
};

let picker;
const config = {
	carts: [testCartOptions],
	resultsLists: [testResultsListOptions]
}

console.log(config)

// main function
function main() {
	picker = document.querySelector('fm-picker');
	// addCart()
}

function addCart(options = testCartOptions) {
	picker.addCart(options);
}

function addResultsList(options = testResultsListOptions) {
	picker.addResultsList(options);
}

function setResultsListData(data, options) {
	data = JSON.parse(data);
	options = JSON.parse(options);
	picker.setResultsListData(options.id, data);
}

function initializePicker(options) {
	options = JSON.parse(options);
	const { carts, resultsLists } = options;

	resultsLists.forEach((resultsListOptions) => {
		addResultsList(resultsListOptions);
	});

	carts.forEach((cartOptions) => {
		addCart(cartOptions);
	});

}

// run main function
document.addEventListener('DOMContentLoaded', main);