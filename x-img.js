import { inject } from "./config.js";

class XImg extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const link = inject(this.getAttribute("link"));
    const img = this.getAttribute("src") ?? `${link}/icon.svg`;
    const legend = this.getAttribute("legend") ?? link ?? img;

    this.shadowRoot.innerHTML = `
            <style>
                :host(*) {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;

                    border: black solid 1px;

                    color: black;
                    text-decoration: none;

                    cursor: pointer;
                }

                img {
                    flex-grow: 1;
                    flex-shrink: 1;
                    flex-basis: 10px;

                    max-width: 100%;
                    max-height: 100%;
                    min-height: 1px;

                    object-fit: contain;
                }

                legend {
                    max-width: 100%;
                    max-height: 100%;

                    text-align: center;
                    font-size: 20px;
                }
            </style>
            <img src='${img}'>
            <legend>${legend}</legend>
        `;
    this.addEventListener('click', () => { 
        window.location = link; 
    });
  }
}

customElements.define("x-img", XImg);
