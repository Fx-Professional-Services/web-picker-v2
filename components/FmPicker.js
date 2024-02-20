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
		</div>
		`;
	}

	get styles() {
		return /*css*/`
		:host {
			display: block;
		}

		#fm-picker {
			display: flex;
			flex-direction: column;
			flex-wrap: nowrap;
			align-items: stretch;
			width: 100%;
			gap: 1em;
		}
		`;
	}

	render() {
		super.render();
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
		cart.allowDuplicates = options.allow_duplicates || true;

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
}

// define the custom element
customElements.define('fm-picker', FmPicker);