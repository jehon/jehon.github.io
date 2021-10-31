
class XImg extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const src = this.getAttribute('src');
        this.shadowRoot.innerHTML = `
            <style>
                :host() {
                    display: block;
                    height: 100%;
                }

                div {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                div > img {
                    flex-grow: 1;
                }

                div > legend {
                    width: 100%;
                    text-align: center;
                }
            </style>
            <div>
                <img src='${src}'>
                <legend>${src}</legend>
            </div>
        `;
    }
}

customElements.define('x-img', XImg);
