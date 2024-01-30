
// initialize picker 
function initializePicker({ config }) {
	const { items, carts, template, options } = config;





}

// return picker results
function getPickerResults() {

}


function validateConfig(config) {
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

	if (!items.id) { 
		errorMesageArray.push("No items.id object was provided");
	} else if (!items.id.key_name) {
		errorMesageArray.push("No items.id.key_name string was provided");
	}

	if (carts) {

		carts.forEach(cart, index => {

			if (!cart.columns) {
				errorMesageArray.push(`No cart.columns array was provided for cart ${index}`);
			} else if (cart.columns.length === 0) {
				errorMesageArray.push(`No cart.columns array was provided for cart ${index}`);
			}

			if (!cart.id) {
				errorMesageArray.push(`No cart.id object was provided for cart ${index}`);
			} else if (!cart.id.key_name) {
				errorMesageArray.push(`No cart.id.key_name string was provided for cart ${index}`);
			}

			// validate columns

			let cartIndex = index;
			cart.columns.forEach(column, index => {
				if (!column.key_name) {
					errorMesageArray.push(`cart ${cartIndex} column ${index} does not have a key_name`);
				}
				
			});


		});
	}


	if (!template) {
		errorMesageArray.push("No template was provided");
	}


}
