// Import the FmResultsList class
// const FmResultsList = require('./FmResultsList');

// Define the test data
const testColumns = [
	{ name: 'ID', type: 'number', item_field_name: 'id' },
	{ name: 'Name', type: 'text', item_field_name: 'name' },
	{ name: 'Price', type: 'number', item_field_name: 'price' },
];

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
      },
      {
        "fieldData": {
          "id": 4,
          "name": "Product D",
          "description": "This is product D",
          "price": 59.99,
          "stock": 120
        },
        "modId": "3",
        "recordId": "1004",
        "portalData": {}
      },
      {
        "fieldData": {
          "id": 5,
          "name": "Product E",
          "description": "This is product E",
          "price": 69.99,
          "stock": 80
        },
        "modId": "4",
        "recordId": "1005",
        "portalData": {}
      },
      {
        "fieldData": {
          "id": 6,
          "name": "Product F",
          "description": "This is product F",
          "price": 79.99,
          "stock": 60
        },
        "modId": "5",
        "recordId": "1006",
        "portalData": {}
      },
      {
        "fieldData": {
          "id": 7,
          "name": "Product G",
          "description": "This is product G",
          "price": 89.99,
          "stock": 40
        },
        "modId": "6",
        "recordId": "1007",
        "portalData": {}
      },
      {
        "fieldData": {
          "id": 8,
          "name": "Product H",
          "description": "This is product H",
          "price": 99.99,
          "stock": 30
        },
        "modId": "7",
        "recordId": "1008",
        "portalData": {}
      },
      {
        "fieldData": {
          "id": 9,
          "name": "Product I",
          "description": "This is product I",
          "price": 109.99,
          "stock": 20
        },
        "modId": "8",
        "recordId": "1009",
        "portalData": {}
      },
      {
        "fieldData": {
          "id": 10,
          "name": "Product J",
          "description": "This is product J",
          "price": 119.99,
          "stock": 10
        },
        "modId": "9",
        "recordId": "1010",
        "portalData": {}
      }
    ]
  }
};

const testRequest = {
  "action": "read",
  "layouts": "query: item (web picker)",
  "limit": 10,
  "query": [
    {
      "name": "*"
    }
  ]

}

let list1, list2, list3, list4;

function main() {

  try {

    // create first table with test data
    // list1 = test1();

    // create second table tha will query for its own data
    list2 = test2();




  } catch (error) {
    console.error(error)
  }

}



// write function for FM to call
function fmSetData(data, list = list2) {
  try {
    data = JSON.parse(data);
    list.queryResponse = data;
  } catch (error) {
    console.error(error);
  }
}

// call main function
if (!window.FileMaker) {
  setTimeout(main, 30);
} else {
  main();
}


function test1() {
  // Create a parent element
  const parentElement = document.createElement('div');
  document.body.appendChild(parentElement);

  // Instantiate the FmResultsList class
  fmResultsList = new FmResultsList(parentElement, testColumns);

  // Check if the class is correctly instantiated
  console.assert(fmResultsList instanceof FmResultsList, 'fmResultsList should be an instance of FmResultsList');

  // Set the queryResponse and check if it's correctly set
  fmResultsList.queryResponse = testResponse.response;

  // console.assert(fmResultsList.queryResponse === testResponse, 'queryResponse should be correctly set');
  // console.assert(fmResultsList.records === testResponse.data, 'records should be correctly set');

  return fmResultsList;

}

function test2() {

  const testColumns = [
    { name: 'Name', type: 'text', item_field_name: 'name' },
    { name: 'Type', type: 'text', item_field_name: 'type' },
    { name: 'Price', type: 'number', item_field_name: 'Price::amount' },
    { name: 'Unit', type: 'text', item_field_name: 'Unit Of Measure::abbreviation' },
    { name: 'Add To Cart', type: 'cart-button', cart_ids: ["cart"] },
  ];

  const testRequest = {
    "action": "read",
    "layouts": "query: item (web picker)",
    "limit": 5,
    "offset":1,
    "query": [
      {
        "type": "==product"
      }
    ]

  }


  // create another parent element
  const parentElement = document.createElement('div');
  document.body.appendChild(parentElement);

  // create another table with same columns that will query FileMaker for data

  fmResultsList = new FmResultsList(parentElement, testColumns, testRequest);
  fmResultsList.requestData();

  return fmResultsList
}

