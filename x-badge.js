
class XBadge extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const prj = this.getAttribute('prj');
        const withPages = this.hasAttribute('pages');

        this.shadowRoot.innerHTML = `
            <style>
                :host(*) {
                    display: block;
                }

                div#root {
                    display: flex;
                    flex-direction: row;
                    flex-grow: 1;
                }

                div#root > * {
                    flex-basis: 200px;
                    flex-grow: 0;
                    flex-shrink: 0;

                    margin: 20px;
                }

                img {
                    height: 25px;
                }

            </style>
            <div id=root>
                <a href='https://github.com/jehon/${prj}'>${prj}</a>
                <img src='https://github.com/jehon/${prj}/actions/workflows/test.yml/badge.svg'>
                <a href='https://github.com/jehon/${prj}/actions'>actions</a>
                <a href='https://github.com/jehon/${prj}/pulls'>pullrequets</a>
            </div>
        `;
    }
}

customElements.define('x-badge', XBadge);
