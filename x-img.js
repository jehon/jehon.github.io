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
                :host() {
                    height: 100%;
                    display: block;

                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;

                    color: black;
                    text-decoration: none;
                }

                * {
                    width: 100%;
                    flex-grow: 1;
                    flex-basis: 10px;

                    max-height: 100%;
                    object-fit: contain;

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
