
let fmResultsList;
let cartsArray = [];

// initialize picker
function initializePicker(config) {

	console.log("initializePicker")

	// parse config if needed
	if (typeof config === 'string') {
		try {
			config = JSON.parse(config);
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	// validate config
	try {
		validateConfig(config);
	} catch (error) {
		console.error(error);
		throw error;
	}

	// build picker

	let { items, carts, template } = config;
	const { request, columns, idKeyName } = items;

	// create parent element
	console.log("create parent element")
	const parentElement = document.createElement('div');
	document.body.appendChild(parentElement);

	// create table
	fmResultsList = new FmResultsList(parentElement, columns, request);

	// tell table perform request to get data from FileMaker
	fmResultsList.requestData();

	// guard against no carts
	if (!carts) {
		return true;
	}

	// create carts
	carts.forEach((cartJson, index) => {

		try {

			// declare to window variable, will change this later 
			const cart = new FmCart(cartJson.rows || [], cartJson.columns, cartJson.idKeyName, template);
			window[`cart${index}`] = cart;
			console.log(`cart${index}`, window[`cart${index}`]);
			document.body.appendChild(cart.cart);

			// add cart to carts array
			cartsArray.push(cart);

		} catch (error) {
			console.error(error);
			throw error;
		};

	});

	// add button to get picker results
	const button = document.createElement('button');
	button.innerHTML = 'Get Picker Results';
	button.onclick = () => getPickerResults();
	document.body.appendChild(button);


}

// return picker results
function getPickerResults(carts = cartsArray) {
	console.log("getPickerResults", carts)
	let blankScriptName = 'blank script';
	let callbackScriptName = 'return parameter as result';

	let results = {}
	carts.forEach((cart, index) => {
		results[`cart${index}`] = cart.results;
	});

	// perform callback script in FileMaker

	// return results w/ option 5
	FileMaker.PerformScriptWithOption(callbackScriptName, JSON.stringify(results), "5");

	// resume the paused script by calling the blank script w/ option 3
	FileMaker.PerformScriptWithOption(blankScriptName, "", "3");

}

// set data from FileMaker
function fmSetData(data, list = fmResultsList) {
	try {
		data = JSON.parse(data);
		list.queryResponse = data;
	} catch (error) {
		console.error(error);
	}
}

// helper functions
function validateConfig(config) {
	const { items, carts, template, options } = config;
	console.log("validateConfig")


	// build one error message for all errors
	let errorMesageArray = [];

	// validate config
	if (!items) {
		errorMesageArray.push("No items object was provided");
	}

	if (!items.request) {
		errorMesageArray.push("No items.request object was provided");
	}

	if (!items.columns) {
		errorMesageArray.push("No items.columns array was provided");
	} else if (items.columns.length === 0) {
		errorMesageArray.push("No items.columns array was provided");
	}

	if (!items.idKeyName) {
		errorMesageArray.push("No items.idKeyName string was provided");
	} 

	if (carts) {

		console.log(carts)

		carts.forEach((cart, index) => {

			if (!cart.columns) {
				errorMesageArray.push(`No cart.columns array was provided for cart ${index}`);
			} else if (cart.columns.length === 0) {
				errorMesageArray.push(`No cart.columns array was provided for cart ${index}`);
			}

			if (!cart.idKeyName) {
				errorMesageArray.push(`No cart.idKeyName string was provided for cart ${index}`);
			}

			// validate columns

			let cartIndex = index;
			cart.columns.forEach((column, index) => {
				if (!column.name) {
					errorMesageArray.push(`cart ${cartIndex} column ${index} does not have a name`);
				}

			});


		});
	}


	if (!template) {
		errorMesageArray.push("No template was provided");
	}

	if (errorMesageArray.length > 0) {
		console.error(errorMesageArray.join("\n"));
		throw new Error(errorMesageArray.join("\n"));
	} else {
		console.log("config is valid")
		return true;
	}

}

function refreshPickerWindow(){
	window.location.reload();
}
