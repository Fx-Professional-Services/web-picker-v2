// base class for all components
class FmComponent extends HTMLElement {

	// static enums
	static ScriptOptions = {
		Continue: '0',
		Halt: '1',
		Exit: '2',
		Resume: '3',
		Pause: '4',
		Suspend: '5',
	}

	// static methods
	static get observedAttributes() {
		return [''];
	}

	// static properties
	static CallbackBridgeScript = 'sub: perform script and callback with result (web picker v3)'; // the name of the connector script
	static RequestScriptName = 'dep: execute data api (web picker v3)'; // script to call to get data from FM
	static SendResultsScriptName = 'return parameter as result (web picker v3)'; // the name of the FM script to call to send results
	static BlankScriptName = 'blank script (web picker v3)'; // name of the blank FM script to call to resume the callstack

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
		this.ids = {};

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


	render() {

		// call sub-class render function during sub-class constructor
		// sub-class render function should call super.render() first
		this.isRendering = true;

		const fragment = document.createDocumentFragment();

		// evaluate template and style
		this.#template.innerHTML = this.template;
		this.#styles.textContent = this.styles;

		// append to shadow root
		fragment.append(this.#styles);
		fragment.append(this.#template.content.cloneNode(true));

		// update the shadow root
		this.shadowRoot.replaceChildren(fragment);

		// set isRendered to true
		this.isRendered = true;
		this.isRendering = false;

		// store the shadow elements by id
		const elements = this.shadowRoot.querySelectorAll('[id]');
		elements.forEach((element) => {
			this.ids[element.id] = element;
		});


	}

	callBridgeScript(options, type = FmComponent.ScriptOptions.Suspend) {

		if(!window.FileMaker) {
			console.error('FileMaker object not found');
			return;
		}



		// call the script
		FileMaker.PerformScript(FmComponent.CallbackBridgeScript, JSON.stringify(options), type);
	}

}