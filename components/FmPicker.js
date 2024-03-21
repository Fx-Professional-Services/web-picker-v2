// import FmComponent from './FmComponent.js';

// container class to hold the results list and cart elements
class FmPicker extends FmComponent {
	constructor() {
		super();
		this.carts = [];
		this.resultsLists = [];
		this.render();
	}

	get template() {
		return /*html*/`
		<div id='fm-picker'>

			<slot></slot>
			<div id='buttons'>
				<picker-button id='cancel-button'>Cancel</picker-button>
				<picker-button id='done-button'>Done</picker-button>
			</div>

		</div>
		`;
	}

	get styles() {
		return /*css*/`

		#fm-picker {
			display: grid;
			grid-template-rows: 500px 150px 30px;;
			row-gap: 10px;
			grid-template-columns: 1fr;
			padding: 10px;
		}

		#buttons {
			display: flex;
			align-items: flex-start;
			gap: 10px;
			grid-row: 3;
		}

		::slotted(fm-results-list) {
			height: 100%;
			grid-row: 1;
			overflow-y: scroll;
			overflow-x: hidden;

		}

		::slotted(fm-cart) {
			height: 100%;
			grid-row: 2;
			overflow-y: scroll;
			overflow-x: hidden;
		}

		`;
	}

	render() {
		super.render();

		// add event listeners
		this.ids['done-button'].addEventListener('click', this.getResults.bind(this));
		this.ids['cancel-button'].addEventListener('click', this.cancel.bind(this));
	}

	connectedCallback() {

		// listen for add-to-cart event
		this.addEventListener('add-to-cart', this.#addToCart);
	}

	initialize(options) {
		// remove any existing carts and results lists
		const elements = [...this.carts, ...this.resultsLists];

		elements.forEach((element) => {
			element.remove();
		});

		// reset the carts and results lists
		this.carts = [];
		this.resultsLists = [];

		// add the results lists
		options.items.forEach((resultsListOptions) => {
			this.addResultsList(resultsListOptions);
		});

		// add the carts
		options.carts.forEach((cartOptions) => {
			this.addCart(cartOptions);
		});
	}

	#addToCart(event) {
		const { detail } = event;
		const { cartIds, row: resultRow } = detail;


		cartIds.forEach((cartId) => {
			const cart = this.querySelector(`#${cartId}`);
			cart.addItems([resultRow]);
		})
	}

	addCart(options) {
		const cart = document.createElement('fm-cart');

		// set the cart properties w/ defaults
		cart.columns = options.columns || [];
		cart.idKeyName = options.id_key_name || '';
		cart.cartTitle = options.title || '';
		cart.rows = options.rows || [];
		cart.resultTemplate = options.template || {};
		cart.allowDuplicates = options.allow_duplicates;
		cart.maxSelections = options.max_selections;

		// set the cart id
		cart.id = options.cart_id;

		// append the cart
		this.append(cart);

		// store the cart
		this.carts.push(cart);

		return cart;
	}

	addResultsList(options) {
		// create the results list
		const resultsList = document.createElement('fm-results-list');
		// set its id first
		resultsList.id = options.id;
		this.append(resultsList);

		({
			columns: resultsList.columns,
			id_key_name: resultsList.idKeyName,
			request: resultsList.request,
		} = options)

		// store the results list
		this.resultsLists.push(resultsList);

		return resultsList;
	}

	setResultsListData(id, data) {
		const resultsList = this.querySelector(`#${id}`);
		resultsList.response = data;
	}

	getResults() {
		const results = {};
		this.carts.forEach((cart) => {
			const result = cart.getResults();
			results[cart.id] = result;
		});

		// send result to paused script
		this.sendResultToPausedScript(results);

		return results;
	}

	cancel() {
		// send result to paused script
		this.sendResultToPausedScript({ user_action: 'cancel' });
	}
}

// define the custom element
customElements.define('fm-picker', FmPicker);

// export the custom element
// export default FmPicker;