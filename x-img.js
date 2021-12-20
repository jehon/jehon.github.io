
class XImg extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        let link = this.getAttribute('link');
        const img = this.getAttribute('src') ?? `${link}/icon.svg`;
        const legend = this.getAttribute('legend') ?? link ?? img;

        this.shadowRoot.innerHTML = `
            <style>
                :host() {
                    display: block;
                    height: 100%;
                }

                a {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                a > img {
                    flex-grow: 1;
                }

                a > legend {
                    width: 100%;
                    text-align: center;
                }
            </style>
            <a href='${link}'>
                <img src='${img}'>
                <legend>${legend}</legend>
            </a>
        `;
    }
}

customElements.define('x-img', XImg);
