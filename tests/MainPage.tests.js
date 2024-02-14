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
		format: 'currency',
		var_name: 'price',
		add_sum: true
	},
	{
		name: 'Quantity (max 10)',
		type: 'number',
		item_field_name: 'quantity',
		editable: true,
		format: 'number',
		var_name: 'quantity',
		default_value: 1,
		add_sum: true,
		max_sum: 10
	}, {
		name: 'Subtotal',
		type: 'expression',
		item_field_name: 'subtotal',
		editable: false,
		format: 'currency',
		var_name: 'subtotal',
		expression: '`$ ${(vars.quantity * vars.price).toFixed(2)}`',
		add_sum: true,
		max_sum: 1000
	}, {
		name: 'string test',
		type: 'expression',
		var_name: 'string test',
		editable: false,
		format: 'string',
		item_field_name: 'string test',
		expression: '`${vars.price} x ${vars.quantity} = ${vars.subtotal}`',
	}
];

const resultColumns = [
	{ name: 'ID', type: 'number', item_field_name: 'id' },
	{ name: 'Name', type: 'text', item_field_name: 'name' },
	{ name: 'Price', type: 'number', item_field_name: 'price' },
	{
		cart_ids: ["cart0"],
		name: "select",
		type: "cart-button"
	}
]
const existingRows = [
	{
		name: 'Product 1',
		price: 10,
		['order item::__id']: 'my existing item id',
	},
	{ name: 'Product 2', price: 20 }, // no id, adding this item will generate a new id
];

const template = {
	'order item::name': 'name',
	'order item::price': '`${vars.price}`',
	'order item::_order id': 'my order id',
	'order item::quantity': '`${vars.quantity}`',
	'order item::subtotal': '`${vars.quantity * vars.price}`',
	'order item::__id': '`${vars.id}`',
};

const id_key_name = 'order item::__id';

const options = {
	max_results: 10,
	auto_submit: false
};

const carts = [
	{
		columns: cartColumns,
		idKeyName: id_key_name
	}
];

const items = {
	columns: resultColumns,
	idKeyName: id_key_name
};

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

// create config object for initializePicker
const config = {
	items,
	carts,
	template,
	options
};

// create a new picker
const {
	fmResultsList: testFmResultsList,
	cartsArray: testCartsArray,
	button: testButton,
} = initializePicker(config, false);

console.log(testFmResultsList, testCartsArray, testButton);

testFmResultsList.queryResponse = testResponse.response;
