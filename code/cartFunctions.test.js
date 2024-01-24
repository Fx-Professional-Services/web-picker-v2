// Test case 1: Valid inputs
const table = document.createElement('table');
document.body.appendChild(table);

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
		expression: '`${vars.quantity * vars.price}`',
	},
];
const rows1 = [
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

const id = { key_name: 'order item::__id' };

let selectedItems = drawCart(table, columns, rows1, id);

// build item to add
const item = { name: 'Product 3', price: 30 };

// add item
selectedItems = selectItem(item, id, selectedItems, columns, table);

// get result
let result = returnSelectedItems(
  selectedItems,
  template,
  id,
  columns,
  table,
);

// Assert that the table has the correct number of rows
console.log(table.rows.length); // Expected output: 4

// Assert that the selectedItems map contains the correct items
console.log(selectedItems.get('Product 1')); // Expected output: { name: 'Product 1', price: 10 }
console.log(selectedItems.get('Product 2')); // Expected output: { name: 'Product 2', price: 20 }
console.log(selectedItems.get('Product 3')); // Expected output: { name: 'Product 3', price: 30 }

console.log(result);

// Test case 2: Missing table parameter
try {
  drawCart(null, columns, rows1, id);
} catch (error) {
  console.log(error.message); // Expected output: 'drawCart: table is required'
}

// Test case 3: Missing columns parameter
try {
  drawCart(table, null, rows1, id);
} catch (error) {
  console.log(error.message); // Expected output: 'drawCart: columns is required'
}

// Test case 4: Missing rows parameter
try {
  drawCart(table, columns, null, id);
} catch (error) {
  console.log(error.message); // Expected output: 'drawCart: rows is required'
}

// Test case 5: Missing id.key_name parameter
try {
  drawCart(table, columns, rows1, {});
} catch (error) {
  console.log(error.message); // Expected output: 'drawCart: id.key_name is required'
}
