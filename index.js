let picker;

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