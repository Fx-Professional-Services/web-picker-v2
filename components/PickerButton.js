// a simple custom element to make styling consistent
class PickerButton extends HTMLElement {
  constructor() {
    super();
    const template = document.createElement('template');
    template.innerHTML = /*html*/ `

		<style>
		button{
			background-color: #FFFFFF;
			border: 0;
			border-radius: 0;
			box-sizing: border-box;
			color: #111827;
			font-family: "Inter var",ui-sans-serif,system-ui,-apple-system,system-ui,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
			font-size: .875rem;
			line-height: 1rem;
			padding: 2px 6px;
			text-align: center;
			cursor: pointer;
			user-select: none;
			-webkit-user-select: none;
			touch-action: manipulation;
		}


    button:hover {
			background-color: rgb(249,250,251);
		}

		button:focus {
		}

		button:focus-visible {
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
