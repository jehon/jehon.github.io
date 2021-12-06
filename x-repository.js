
import { Octokit } from "https://cdn.skypack.dev/@octokit/rest";
import { throttling } from "https://cdn.skypack.dev/@octokit/plugin-throttling";
import { retry } from "https://cdn.skypack.dev/@octokit/plugin-retry";

//
// https://docs.github.com/en/rest/reference/repos#statuses
// https://serene-nightingale-a870d8.netlify.app/
//

const octokit = new (Octokit.plugin(throttling).plugin(retry))
    ({
        throttle: {
            onRateLimit: (retryAfter, options) => {
                octokit.log.warn(
                    `Request quota exhausted for request ${options.method} ${options.url}`
                );

                if (options.request.retryCount === 0) {
                    // only retries once
                    octokit.log.info(`Retrying after ${retryAfter} seconds!`);
                    return true;
                }
            },
            onAbuseLimit: (retryAfter, options) => {
                // does not retry, only logs a warning
                octokit.log.warn(
                    `Abuse detected for request ${options.method} ${options.url}`
                );
            }
        },
        userAgent: "jehon personal dashboard",
    })


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
                        <div id='badge'>    
                            <img src='https://github.com/${this.owner}/${this.prj}/actions/workflows/test.yml/badge.svg?branch=main' onerror="this.style.display='none'">
                        </div>
                        <div id='pr'></div>
                        <div id='branches'></div>
                        <div id='spacer'></div>
                        <div id='inner' class='.btn-group-vertical'>
                            <slot></slot>
                        </div>
                        <div id='actions'>
                            <a href="https://github.com/${this.owner}/${this.prj}/pulls" class="btn btn-primary">Pull requests</a>
                            <a href="https://github.com/${this.owner}/${this.prj}/actions/workflows/test.yml" class="btn btn-primary">Actions</a>
                        </div>
                    </div>
                </div>
            </div >
    `;

        const prEl = this.shadowRoot.querySelector('#pr');
        prEl.innerHTML = '';

        const branchesEl = this.shadowRoot.querySelector('#branches');
        branchesEl.innerHTML = '';

        octokit.pulls.list({
            owner: this.owner,
            repo: this.prj
        })
            // .then(data => Array.isArray(data) ? data : [])
            .then(result => result.data)
            .then(data => {
                data.map(pr => {
                    console.log(pr);


                    // https://api.github.com/repos/${this.owner}/kiosk/pulls/620/commits
                    // => parents.0.url => + /status
                    // => https://api.github.com/repos/${this.owner}/kiosk/commits/771b2184adaf85853901515bf1edb2875df3ab11/status
                    //   => .status

                    // cryptomedic.811:
                    //                     head.sha
                    //                     722fe1ebb17c61ac0b09e4ea5a2740f340728a85

                    // https://api.github.com/repos/${this.owner}/cryptomedic/commits/722fe1ebb17c61ac0b09e4ea5a2740f340728a85/status

                    // https://api.github.com/repos/:owner/:repo/commits/:ref/statuses

                    // Thanks to: https://stackoverflow.com/a/29449704/1954789 
                    // https://api.github.com/repos/${this.owner}/cryptomedic/commits/722fe1ebb17c61ac0b09e4ea5a2740f340728a85/statuses
                    // https://api.github.com/repos/${this.owner}/cryptomedic/commits/722fe1ebb17c61ac0b09e4ea5a2740f340728a85/status

                    // Ref: https://docs.github.com/en/rest/reference/repos#statuses
                    //   status => agglomerated
                    //   statuses => what ? protected ?

                    prEl.innerHTML += `<div><a href='${pr.html_url ?? ''}'>PR: ${pr.user?.login ?? ''} - ${pr.title ?? ''}</a></div>`;
                })
                return data;
            })
            .then(data => data.map(pr => pr.head.ref))
            .then(branchesInPr => {
                // console.log(branchesInPr);
                octokit.request('GET /repos/{owner}/{repo}/branches', {
                    owner: this.owner,
                    repo: this.prj
                })
                    .then(result => result.data)
                    // .then(data => Array.isArray(data) ? data : [])
                    .then(data => data.map(br => br.name))
                    .then(branches => branches.filter(br => !branchesInPr.includes(br) && br != "main" && br != 'gh-pages'))
                    .then(branches => branches.map(br => {
                        // console.log(branches);
                        branchesEl.innerHTML += `<div>${br}</div>`
                    }));
            })

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
    }
}

customElements.define(XRepository.tag, XRepository);
