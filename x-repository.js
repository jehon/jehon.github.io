

import octokit from './x-github-auth.js'

//
// https://docs.github.com/en/rest/reference/repos#statuses
// https://serene-nightingale-a870d8.netlify.app/
//
// https://github.com/octokit/auth-app.js#usage-with-octokit
//

//
// https://github.com/octokit/authentication-strategies.js/
//  ==> token https://github.com/settings/tokens/new
//

class XRepository extends HTMLElement {
    static get tag() {
        return "x-repository";
    }

    /** @type {string} the repository*/
    owner;

    /** @type {string} the repository*/
    prj;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    lightWarning(txt = 'warning') {
        this.setAttribute('warning', txt);
    }

    connectedCallback() {
        this.prj = this.getAttribute('prj');
        this.owner = "jehon";

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

                :host([warning]) {
                    background-color: #C95C00;
                }

                :host([no-badge]) #badge {
                    display: none;
                }
                
                [hidden] {
                    display: none
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
                    <a class="card-link" href='https://github.com/${this.owner}/${this.prj}'>${this.prj}</a>
                </div>
                <div class="card-body">
                    <div class="card-text">
                        <div id='badge'></div>
                        <div id='remote-containers' class='.btn-group-vertical'>
                            <a href='vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/${this.owner}/${this.prj}' class='btn btn-primary'>
                            <img src='/vscode.svg' />
                            Local
                            </a>
                        </div>
                        <div id='codespaces' class='.btn-group-vertical'></div>
                        <div id='pr'></div>
                        <div id='branches'></div>
                        <div id='spacer'></div>
                        <div id='inner' class='.btn-group-vertical'>
                            <slot></slot>
                        </div>
                        <div id='actions'>
                            <span id='npm'></span>
                            <a id='pages' hidden href="https://jehon.github.io/${this.prj}" class="btn btn-warning" >Github pages</a>
                            <a href="https://github.com/${this.owner}/${this.prj}/pulls" class="btn btn-primary">Pull requests</a>
                        </div>
                    </div>
                </div>
            </div >
    `;

        // Problem: CORS

        // Array.from(this.querySelectorAll('[watch]')).map(
        //     el => {
        //         const url = el.getAttribute('href');
        //         console.log(el, url);

        //         const controller = new AbortController()
        //         const timeoutId = setTimeout(() => {
        //             controller.abort();
        //             console.log("Failure: ", url);
        //         }, 5000)
        //         fetch(url, { signal: controller.signal }).then(response => {
        //             console.log("Success: ", url);
        //             clearTimeout(timeoutId);
        //         })
        //     }
        // )

        this.refreshData();
        setTimeout(() => this.refreshData(), 5 * 60 * 1000);
    }

    async refreshData() {
        this.removeAttribute('warning');

        const npm = this.getAttribute('npm');

        const actionsEl = this.shadowRoot.querySelector('#badge');
        actionsEl.innerHTML = '';

        const prEl = this.shadowRoot.querySelector('#pr');
        prEl.innerHTML = '';

        const branchesEl = this.shadowRoot.querySelector('#branches');
        branchesEl.innerHTML = '';

        const codespacesEl = this.shadowRoot.querySelector('#codespaces');
        codespacesEl.innerHTML = '';

        const pagesEl = this.shadowRoot.querySelector('#pages');

        return Promise.all(
            [
                (this.getAttribute('workflows') ?? 'test')
                    .split(',')
                    .forEach(workflow => {
                        const src = `https://github.com/${this.owner}/${this.prj}/actions/workflows/${workflow}.yml/badge.svg?branch=main`;
                        actionsEl.insertAdjacentHTML('beforeend',
                            `<a id=${workflow} href='https://github.com/${this.owner}/${this.prj}/actions/workflows/${workflow}.yml'>
                               <img src='${src}' onerror="this.style.display='none'">
                            </a>`);
                        // fetch(src).then(response => response.data)
                    }),

                octokit.pulls.list({
                    owner: this.owner,
                    repo: this.prj
                })
                    .then(result => result.data)
                    .then(data => {
                        data.map(pr => {
                            console.log(pr);

                            prEl.insertAdjacentHTML('beforeend', `
                                <div branch='${pr.branch}'>
                                    <a href='${pr.html_url ?? ''}'>PR: ${pr.user?.login ?? ''} - ${pr.title ?? ''}</a>
                                    ${pr.head.ref}
                                </div>
                            `);

                            // https://docs.github.com/en/rest/actions/workflow-runs?apiVersion=2022-11-28
                        })
                        if (data.length > 0) {
                            this.lightWarning('pr');
                        }
                        return data;
                    })
                    .then(data => data.map(pr => pr.head.ref))
                    .then(branchesInPr =>
                        octokit.request('GET /repos/{owner}/{repo}/branches', {
                            owner: this.owner,
                            repo: this.prj
                        })
                            .then(result => result.data)
                            // .then(data => Array.isArray(data) ? data : [])
                            .then(data => data.map(br => br.name))
                            .then(branches => {
                                if (branches.includes('gh-pages')) {
                                    pagesEl.removeAttribute('hidden');
                                } else {
                                    pagesEl.setAttribute('hidden', 'hidden');
                                }
                                return branches;
                            })
                            .then(branches => branches.filter(br => !branchesInPr.includes(br) && br != "main" && br != 'gh-pages'))
                            .then(branches => branches.map(br => {
                                // console.log(branches);
                                branchesEl.innerHTML += `<div>${br}</div>`
                            }))
                    )
                    .catch(() => true), // TODO: not clean

                // octokit.request("GET /repos/{owner}/{repo}/codespaces", {
                //     owner: this.owner,
                //     repo: this.prj
                // })
                //     .then(result => result.data)
                //     .then(data => {
                //         data.codespaces.map(cd => codespacesEl.insertAdjacentHTML('beforeend', `<a href="${cd.web_url}" class="btn btn-success">${cd.pulls_url ?? 'main'}</a>`));
                //         //     if (data.codespaces.length <= 0) {
                //         //         // Codespaces:
                //         //         //   None is found, we propose to create one:
                //         //         //
                //         //         //   see https://docs.github.com/en/rest/codespaces/codespaces#create-a-codespace-for-the-authenticated-user
                //         //         //
                //         //         codespacesEl.insertAdjacentHTML('beforeend', `
                //         //     <a class="btn btn-warning">New!</a>
                //         // `);
                //         //     codespacesEl.querySelector('a').addEventListener('click', () => {
                //         //         octokit.request('POST /user/codespaces', {
                //         //             repository_id: 1,
                //         //             ref: 'main',
                //         //             location: 'WestUs2'
                //         //         }).then(data => {
                //         //             console.log("Created here: ", data.web_url);
                //         //         })

                //         //     })
                //         // }
                //     })
                //     .catch(() => true), // TODO: not clean

                Promise.resolve()
                    .then(() => {
                        if (npm) {
                            return fetch(`https://registry.npmjs.org/${npm}`)
                                .then(response => response.json())
                                .then(json => this.shadowRoot.querySelector('#npm').innerHTML = `<a class="btn btn-outline-info" href="https://www.npmjs.com/package/${npm}">version ${json["dist-tags"].latest}</a>`)
                        }
                    })
                    .catch(() => true), // TODO: not clean
            ]);
    }
}

customElements.define(XRepository.tag, XRepository);
