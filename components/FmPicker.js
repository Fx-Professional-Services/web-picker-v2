// container class to hold the results list and cart elements
class FmPicker extends FmComponent {
	constructor() { 
		super();
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
		cart.columns = options.columns;
		cart.idKeyName = options.idKeyName;
		cart.template = options.template;
		this.appendChild(cart);
	}
}

// define the custom element
customElements.define('fm-picker', FmPicker);