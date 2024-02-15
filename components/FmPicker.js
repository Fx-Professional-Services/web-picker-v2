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
		console.log('add-to-cart event', event);
	}
}

// define the custom element
customElements.define('fm-picker', FmPicker);