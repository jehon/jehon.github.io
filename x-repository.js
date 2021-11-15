
class XRepository extends HTMLElement {
    static get tag() {
        return "x-repository";
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' })
    }

    connectedCallback() {
        const prj = this.getAttribute('prj');

        this.shadowRoot.innerHTML = `
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
                <style>
                :host(*) {
                    display: flex;
                    flex-direction: row;
                    flex-grow: 1;

                    width: 100%;
                }

                :host(*) > * {
                    width: 100%;
                    margin: 20px;
                }

                div.card-text {
                    margin: 20px;
                    display: flex;
                    align-items: center;
                }

                div.card-text > * {
                    padding-right: 10px;
                }

                div.card-text > #badge {
                    width: 200px;
                    text-align: center;
                }
                div.card-text > #spacer {
                    flex-grow: 1000;
                }

                div.card-text > #inner {
                    display: flex;
                    flex-flow: column nowrap;
                    text-align: center;
                }

                ::slotted(*) {
                    margin-bottom: 5px;
                }

                div.card-text > #actions {
                    text-align: right;
                }

                img {
                    height: 25px;
                }
                
            </style>
            <div class="card">
                <div class="card-header">
                    <a class="card-link" href='https://github.com/jehon/${prj}'>${prj}</a>
                </div>
                <div class="card-body">
                    <div class="card-text">
                        <div id='badge'>    
                            <img src='https://github.com/jehon/${prj}/actions/workflows/test.yml/badge.svg?branch=main'>
                        </div>
                        <div id='pr'></div>
                        <div id='branches'></div>
                        <div id='spacer'></div>
                        <div id='inner' class='.btn-group-vertical'>
                            <slot></slot>
                        </div>
                        <div id='actions'>
                            <a href="https://github.com/jehon/${prj}/pulls" class="btn btn-primary">Pull requests</a>
                            <a href="https://github.com/jehon/${prj}/actions/workflows/test.yml" class="btn btn-primary">Actions</a>
                        </div>
                    </div>
                </div>
            </div >
    `;

        const prEl = this.shadowRoot.querySelector('#pr');
        prEl.innerHTML = '';

        const branchesEl = this.shadowRoot.querySelector('#branches');
        branchesEl.innerHTML = '';

        const rootAPI = `https://api.github.com/repos/jehon/${prj}`;

        fetch(`${rootAPI}/pulls`)
            .then(resp => resp.json())
            .then(data => {
                data.map(pr => {
                    // console.log(pr);
                    prEl.innerHTML += `<div><a href='${pr.html_url ?? ''}'>PR: ${pr.user?.login ?? ''} - ${pr.title ?? ''}</a></div>`;
                })
                return data;
            })
            .then(data => data.map(pr => pr.head.ref))
            .then(branchesInPr => {
                // console.log(branchesInPr);
                fetch(`${rootAPI}/branches`)
                    .then(resp => resp.json())
                    .then(data => data.map(br => br.name))
                    .then(branches => branches.filter(br => !branchesInPr.includes(br) && br != "main" && br != 'gh-pages'))
                    .then(branches => branches.map(br => {
                        // console.log(branches);
                        branchesEl.innerHTML += `<div>${br}</div>`
                    }));
            })

        Array.from(this.querySelectorAll('[port]')).map(
            el => {
                const port = el.getAttribute('port');
                console.log(el, port);
            }
        )
    }
}

customElements.define(XRepository.tag, XRepository);
