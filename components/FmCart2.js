// test data

class FmCart2 extends FmComponent {
	// static methods
	static get observedAttributes() {
		return [''];
	}
	// static properties

	// private properties

	// constructor
	constructor() {
		try {
			super();

		} catch (error) {
			throw error;
		}
	}

	/* lifecycle methods */

	/**
	 * Called when the custom element is connected to the DOM.
	 * Adds event listeners and requests data if available.
	 * @throws {Error} If an error occurs during execution.
	 */
	connectedCallback() {
		try {

			this.render();

		} catch (error) {
			throw error;
		}

	}

	/**
	 * Renders the component.
	 * @throws {Error} If an error occurs during rendering.
	 */
	render() {
		try {
			// call this during constructor
			// call super.render() first to seed the shadowRoot
			super.render();

		} catch (error) {
			throw error;
		}

	}

	/* getters */
	get template() {
		return /*html*/ `
		<table>
			<thead>
				<tr id='title-row'><td colspan='100%' id='title-cell'>Table Title</td></tr>
				<tr id='header-row'></tr>
			</thead>
			<tbody>
			</tbody>
			<tfoot>
				<tr id='summary-row'></tr>
				<tr id='bottom-buttons-row'>
					<td><button id='cancel-button'>Cancel</button></td>
					<td><button id='cancel-button'>Done</button></td>
					</tr>
			</tfoot>
		</table>
		`;
	}

	get styles() {
		return /*css*/ `
		table {
			width: 100%;
		}

		#title-row {
			background-color: #f0f0f0;
		}

		#title-cell {
			font-size: 1.5em;
			font-weight: bold;
		}

		#header-row {
			background-color: #f0f0f0;
		}
		`;
	}

	/* setters */

	/* private methods */

	/* public methods */
}

customElements.define('fm-cart', FmCart2);
