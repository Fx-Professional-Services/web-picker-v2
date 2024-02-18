// base class for all components
class FmComponent extends HTMLElement {

	// static methods
	static get observedAttributes() {
		return [''];
	}

	// static properties
	static RequestScriptName = ''; // the name of the FileMaker request script

	// private properties
	#template
	#styles

	// constructor
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.#template = document.createElement('template');
		this.#styles = document.createElement('style');
		this.isRendered = false;
		this.isRendering = false;

	}

	// getters and setters
	get template() {
		return /*html*/`
		`;

	}

	get styles() { 
		return /*css*/ `
		`;

	}

	// lifecycle methods

	attributeChangedCallback(name, oldValue, newValue) { 
		// be default, render when an observed attribute changes
		this.render();

	}

	// public methods
	firstRender() {
		this.render();
		this.isRendered = true;
	}


	render() {

		// call sub-class render function during sub-class constructor
		// sub-class render function should call super.render() first

		const fragment = document.createDocumentFragment();

		// evaluate template and style
		this.#template.innerHTML = this.template;
		this.#styles.textContent = this.styles;

		// append to shadow root
		fragment.append(this.#styles);
		fragment.append(this.#template.content.cloneNode(true));

		// append to shadow root
		this.shadowRoot.replaceChildren(fragment);

	}

}