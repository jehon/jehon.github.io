
//   https://api.github.com/repos/octocat/hello-world/pulls

class XRepository extends HTMLElement {
    static get tag() {
        return "x-repository";
    }

    connectedCallback() {
        const prj = this.getAttribute('prj');
        const withPages = this.hasAttribute('pages');

        this.innerHTML = `
            <style>
                ${this.constructor.tag} {
                    display: flex;
                    flex-direction: row;
                    flex-grow: 1;

                    width: 100%;
                }

                ${this.constructor.tag} > * {
                    flex-basis: 200px;
                    flex-grow: 0;
                    flex-shrink: 0;

                    margin: 20px;
                }

                ${this.constructor.tag} img {
                    height: 25px;
                }

            </style>
            <a href='https://github.com/jehon/${prj}'>${prj}</a>
            <img src='https://github.com/jehon/${prj}/actions/workflows/test.yml/badge.svg?branch=main'>
            <a href='https://github.com/jehon/${prj}/actions/workflows/test.yml'>actions</a>
            <a href='https://github.com/jehon/${prj}/pulls'>pullrequets</a>
        `;
    }
}

customElements.define(XRepository.tag, XRepository);
