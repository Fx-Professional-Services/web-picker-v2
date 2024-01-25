// Test case 1: Valid inputs
const columns = [
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
  },
  {
    name: 'Quantity',
    type: 'number',
    item_field_name: 'quantity',
    editable: true,
    format: 'number',
    var_name: 'quantity',
    default_value: 1,
	}, {
		name: 'Subtotal',
		type: 'expression',
		item_field_name: 'subtotal',
		editable: false,
		format: 'currency',
		var_name: 'subtotal',
    expression: '`$ ${(vars.quantity * vars.price).toFixed(2)}`',
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
  'order item::price': 'price',
  'order item::_order id': 'my order id',
  'order item::quantity': '`${vars.quantity}`',
  'order item::subtotal': '`${vars.quantity * vars.price}`',
  'order item::__id': '`${vars.id}`',
};

const id_key_name = 'order item::__id';

// build another item to add to the cart
const itemJson = {
	name: 'Product 3',
	price: 30,
	quantity: 2,
	["order item::__id"]: "my other existing id"
};

// build the cart
let cart;

try {

	cart = new FmCart([], columns, id_key_name, template);
	document.body.appendChild(cart.cart);
	// console.log('results', cart.results);

	// add the item to the cart
	cart.addItem(itemJson);

} catch (error) {
	console.error(error);
}





