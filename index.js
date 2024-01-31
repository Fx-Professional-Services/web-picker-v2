
let fmResultsList;
let cartsArray = [];
let button;

// initialize picker
function initializePicker(config) {


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

	let { items, carts, template, options } = config;
	const { request, columns, idKeyName } = items;

	// create parent element
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
			const cart = new FmCart(cartJson.rows, cartJson.columns, cartJson.idKeyName, template, options);
			window[`cart${index}`] = cart;
			document.body.appendChild(cart.cart);

			// add cart to carts array
			cartsArray.push(cart);

		} catch (error) {
			console.error(error);
			throw error;
		};

	});

	// add button to get picker results
	button = document.createElement('button');
	button.innerHTML = 'Done';
	button.onclick = () => getPickerResults();


	// add button to cancel
	cancelButton = document.createElement('button');
	cancelButton.innerHTML = 'Cancel';
	cancelButton.onclick = () => {
		// send result to filemaker
		sendResultToFileMaker({ user_canceled: true });
		// reset
		reset(cartsArray);
	}
	document.body.appendChild(cancelButton);
	document.body.appendChild(button);




	// add listener for maxResults event 
	document.addEventListener('maxResults', handleMaxResults);

}

function handleMaxResults(event) {
	console.log("maxResults event", event.detail);
	if (event.detail.auto_submit) {
		getPickerResults(cartsArray);
	}
}

// return picker results
function getPickerResults(carts = cartsArray) {

	let blankScriptName = 'blank script';
	let callbackScriptName = 'return parameter as result';

	let results = {}
	carts.forEach((cart, index) => {
		results[`cart${index}`] = cart.results;
	});

	// send results to FileMaker
	sendResultToFileMaker(results);

	// reset
	reset(carts);

}

function sendResultToFileMaker(result) {

	const blankScriptName = 'blank script';
	const callbackScriptName = 'return parameter as result';

	try {
		// return results w/ option 5
		FileMaker.PerformScriptWithOption(callbackScriptName, JSON.stringify(result), "5");

		// resume the paused script by calling the blank script w/ option 3
		FileMaker.PerformScriptWithOption(blankScriptName, "", "3");

	} catch (error) {
		throw error;
	}
}

// reset function
function reset(carts) {
	// remove carts from DOM and window variables
	carts.forEach((cart, index) => {
		cart.cart.remove();
		window[`cart${index}`] = null;
	});

	// delete the document body and recreate it
	document.body.remove();
	document.body = document.createElement('body');

	// reset and prepare for another configuration
	cartsArray = [];
	fmResultsList = null;
	button = null;

	// remove event listener for maxResults
	document.removeEventListener('maxResults', handleMaxResults);
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

	if (options) {
		if (options.max_results) {
			if (typeof options.max_results !== 'number') {
				errorMesageArray.push("options.max_results must be a number");
			}
		}
	}

	if (errorMesageArray.length > 0) {
		console.error(errorMesageArray.join("\n"));
		throw new Error(errorMesageArray.join("\n"));
	} else {
		return true;
	}

}
