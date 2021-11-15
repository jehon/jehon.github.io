
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
                    width: 100%;
                    margin: 20px;
                }

                ${this.constructor.tag} div.card-text {
                    margin: 20px;
                    display: flex;
                    align-items: center;
                }

                ${this.constructor.tag} div.card-text > * {
                    padding-right: 10px;
                }

                ${this.constructor.tag} img {
                    height: 25px;
                }
                
            </style>
            <div class="card">
                <div class="card-header">
                    <a class="card-link" href='https://github.com/jehon/${prj}'>${prj}</a>
                </div>
                <div class="card-body">
                    <div class="card-text">
                        <img src='https://github.com/jehon/${prj}/actions/workflows/test.yml/badge.svg?branch=main'>
                        <div id='pr'></div>
                    </div>
                    <a href="https://github.com/jehon/${prj}/pulls" class="btn btn-primary">Pull requests</a>
                    <a href="https://github.com/jehon/${prj}/actions/workflows/test.yml" class="btn btn-primary">Actions</a>
                </div>
            </div>
        `;

        const prEl = this.querySelector('#pr');
        console.log(prj, prEl)
        prEl.innerHTML = '';

        fetch(`https://api.github.com/repos/jehon/${prj}/pulls`)
            .then(resp => resp.json())
            .then(data => data.map(pr => {
                // console.log(pr)
                console.log(pr.html_url, pr.title, pr.user.login);
                prEl.innerHTML += `<div><a href='${pr.html_url ?? ''}'>PR: ${pr.title ?? ''} (${pr.user?.login ?? ''})</a></div>`;

            }))
    }
}

customElements.define(XRepository.tag, XRepository);
