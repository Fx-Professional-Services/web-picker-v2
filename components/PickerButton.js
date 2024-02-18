// a simple custom element to make styling consistent
class PickerButton extends HTMLElement {
	constructor() {
		super();
		const template = document.createElement('template');
		template.innerHTML = /*html*/`

		<style>
			button {
				border: none;
				color: white;
				background-color: #007bff;
				padding: 4px 8px;
				text-align: center;
				text-decoration: none;
				display: inline-block;
				font-size: 1em;
				margin: 0;
				cursor: pointer;
				box-sizing: border-box;
			}
			button:hover {
				background-color: #0056b3;
			}
		</style>
		<button><slot></slot></button>
		`;

		this.attachShadow({ mode: 'open' });
		this.shadowRoot.appendChild(template.content.cloneNode(true));
	}


}

// export the custom element
customElements.define('picker-button', PickerButton);