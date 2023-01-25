
import { inject } from './config.js'

class XImg extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const link = inject(this.getAttribute('link'));
        const img = this.getAttribute('src') ?? `${link}/icon.svg`;
        const legend = this.getAttribute('legend') ?? link ?? img;

        this.shadowRoot.innerHTML = `
            <style>
                :host() {
                    height: 100%;
                    display: block;
                }

                a {
                    height: 100%;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                }

                a > img {
                    display: block;
                    width: 100%;
                    flex-grow: 1;
                    flex-shrink: 1;
                    flex-basis: 10px;

                    max-height: 100%;
                    object-fit: contain;
                }

                a > legend {
                    display: block;
                    width: 100%;
                    flex-grow: 0;
                    flex-shrink: 0;

                    text-align: center;
                    font-size: 10px;
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
