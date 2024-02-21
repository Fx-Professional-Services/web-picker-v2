// a simple custom element to make styling consistent
class PickerButton extends HTMLElement {
	constructor() {
		super();
		const template = document.createElement('template');
		template.innerHTML = /*html*/`

		<style>

		</style>
		<button><slot></slot></button>
		`;

		this.attachShadow({ mode: 'open' });
		this.shadowRoot.appendChild(template.content.cloneNode(true));
	}


}

// export the custom element
customElements.define('picker-button', PickerButton);