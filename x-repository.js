//
// https://docs.github.com/en/rest/reference/repos#statuses
// https://serene-nightingale-a870d8.netlify.app/
//
// https://github.com/octokit/auth-app.js#usage-with-octokit
//

class XRepository extends HTMLElement {
  static get tag() {
    return "x-repository";
  }

  /** @type {string} the repository*/
  owner;

  /** @type {string} the repository*/
  prj;

  /** @type {number} the level of warning */
  warningLevel = 0;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  lightWarning(level = 1, _txt = "warning") {
    this.warningLevel = Math.max(this.warningLevel, level);
    this.setAttribute("warning", level);
  }

  connectedCallback() {
    this.prj = this.getAttribute("prj");
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

                :host([running]) {
                    /* thanks to: https://css-tricks.com/stripes-css/ */
                    background: repeating-linear-gradient(
                            135deg,
                            rgba(255, 153, 0, 0.4),
                            rgba(255, 153, 0, 0.4) 10px,
                            rgba(0, 0, 0, 0.4) 10px,
                            rgba(0, 0, 0, 0.4) 20px
                        )
                }

                :host([warning="1"]) {
                    background-color: #807f7e;
                }

                :host([warning="2"]) {
                    background-color: #F5EF7D;
                }

                :host([warning="3"]) {
                    background-color: #C95C00;
                }

                :host([no-badge]) #badge {
                    display: none;
                }

                :host(*) > * {
                    width: 100%;
                    margin: 20px;
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

                img[inline] {
                  height: 1em;
                }
                
            </style>
            <div class="card">
                <div class="card-header" id="header">
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
                            <span id='version'></span>
                            <a id='pages' hidden href="https://jehon.github.io/${this.prj}" class="btn btn-warning" >Github pages</a>
                            <a href="https://github.com/${this.owner}/${this.prj}/pulls" class="btn btn-primary">Pull requests</a>
                        </div>
                    </div>
                </div>
            </div >
    `;

    this.el = Object.freeze({
      header: this.shadowRoot.querySelector("#header"),
      badge: this.shadowRoot.querySelector("#badge"),
      branches: this.shadowRoot.querySelector("#branches"),
      codespaces: this.shadowRoot.querySelector("#codespaces"),
      pages: this.shadowRoot.querySelector("#pages"),
      pr: this.shadowRoot.querySelector("#pr"),
      version: this.shadowRoot.querySelector("#version"),
    });

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
  }

  async getWorkflowStatuses(octokit, n, branch, path = "") {
    // https://docs.github.com/en/rest/actions/workflow-runs#list-workflow-runs-for-a-repository
    return (
      octokit
        .request(
          "GET /repos/{owner}/{repo}/actions/runs?branch={branch}&per_page={per_page}",
          {
            owner: this.owner,
            repo: this.prj,
            branch: branch,
            per_page: n,
          },
        )
        .then((result) => result.data.workflow_runs)
        .then((runs) => (path ? runs.filter((run) => run.path == path) : runs))
        .then((runs) => runs.map((run) => run.conclusion))
        .then((results) => results.slice(0, 5))
        // success, canceled, failure
        .then((results) => {
          if (
            results.reduceRight(
              (prev, current) =>
                current == "canceled" ? prev : current == "failure",
              false,
            )
          )
            this.lightWarning(branch == "main" ? 3 : 2, "runs");
          return results;
        })
        .then((results) =>
          results.map((result) => {
            let char = "";
            switch (result) {
              case "success":
                char = "✅";
                break;
              case "canceled":
                char = "?";
                break;
              case "failure":
                char = "❌";
                break;
              default:
                char = result;
                break;
            }
            return char;
          }),
        )
        .then((chars) => chars.join(""))
    );
  }

  async refreshData() {
    if (this.hasAttribute("running")) {
      console.log("Already running", this.prj);
      return;
    }
    this.setAttribute("running", "running");

    this.removeAttribute("warning");
    this.warningLevel = 0;
    this.lightWarning(0);

    const npm = this.getAttribute("npm");
    const versionUrl = this.getAttribute("version-url");
    const ts = new Date().getTime();

    this.el.header.innerHTML = `<a class="card-link" href='https://github.com/${this.owner}/${this.prj}'>${this.prj}</a>`;
    this.el.version.innerHTML = "";
    this.el.badge.innerHTML = "";
    this.el.pr.innerHTML = "";
    this.el.branches.innerHTML = "";
    this.el.codespaces.innerHTML = "";

    this.workflows = {};
    return Promise.all([
      this.hasAttribute("no-badge") ||
        (this.getAttribute("workflows") ?? "test")
          .split(",")
          .forEach(async (workflow) => {
            this.el.badge.insertAdjacentHTML(
              "beforeend",
              `<a id=${workflow} href='https://github.com/${this.owner}/${this.prj}/actions/workflows/${workflow}.yml'>
                <img 
                    src='https://github.com/${this.owner}/${this.prj}/actions/workflows/${workflow}.yml/badge.svg?branch=main&ts=${ts}' 
                    onerror="this.style.display='none'"
                >
            </a>`,
            );
            await this.getWorkflowStatuses(
              (await import("./x-github-auth.js")).octokit,
              3,
              "main",
              `.github/workflows/${workflow}.yml`,
            );
          }),

      Promise.resolve()
        .then(() => {
          if (npm) {
            return fetch(`https://registry.npmjs.org/${npm}`)
              .then((response) => response.json())
              .then(
                (json) =>
                  (this.el.version.innerHTML = `<a class="btn btn-outline-info" href="https://www.npmjs.com/package/${npm}">version ${json["dist-tags"].latest}</a>`),
              );
          } else if (versionUrl) {
            return fetch(versionUrl)
              .then((response) => response.text())
              .then(
                (text) =>
                  (this.el.version.innerHTML = `<span class="btn btn-outline-info" >version ${text}</span>`),
              );
          }
        })
        .catch(() => true), // TODO: not clean

      import("./x-github-auth.js")
        .then((x_github_auth) => x_github_auth.octokit)
        .then(
          (octokit) =>
            octokit.pulls
              .list({
                owner: this.owner,
                repo: this.prj,
              })
              .then((result) => result.data)
              .then((data) => {
                data.map(async (pr) => {
                  // console.log(pr);

                  this.el.pr.insertAdjacentHTML(
                    "beforeend",
                    `
                                    <div branch='${pr.branch}'>
                                        <a href='${pr.html_url ?? ""}'>PR: ${
                                          pr.user?.login ?? ""
                                        } - ${pr.title ?? ""}</a>
                                        ${await this.getWorkflowStatuses(
                                          octokit,
                                          1,
                                          pr.head.ref,
                                        )}
                                    </div>
                        `,
                  );
                });
                if (data.length > 0) {
                  this.lightWarning(1, "pr");
                }
                return data;
              })
              .then((data) => data.map((pr) => pr.head.ref))
              .then((branchesInPr) =>
                octokit
                  .request("GET /repos/{owner}/{repo}/branches", {
                    owner: this.owner,
                    repo: this.prj,
                  })
                  .then((result) => result.data)
                  // .then(data => Array.isArray(data) ? data : [])
                  .then((data) => data.map((br) => br.name))
                  .then((branches) => {
                    if (branches.includes("gh-pages")) {
                      this.el.pages.removeAttribute("hidden");
                    } else {
                      this.el.pages.setAttribute("hidden", "hidden");
                    }
                    return branches;
                  })
                  .then((branches) =>
                    branches.filter(
                      (br) =>
                        !branchesInPr.includes(br) &&
                        br != "main" &&
                        br != "gh-pages",
                    ),
                  )
                  .then((branches) =>
                    branches.map((br) => {
                      // console.log(branches);
                      this.el.branches.innerHTML += `<div>
                      <a href='https://github.com/${this.owner}/${this.prj}/tree/${br}'>
                        <img inline src='https://upload.wikimedia.org/wikipedia/commons/e/ed/Octicons-git-branch.svg'>
                        ${br}
                      </a>
                    </div>`;
                    }),
                  ),
              ),

          // octokit.request("GET /repos/{owner}/{repo}/codespaces", {
          //     owner: this.owner,
          //     repo: this.prj
          // })
          //     .then(result => result.data)
          //     .then(data => {
          //         data.codespaces.map(cd => this.el.codespaces.insertAdjacentHTML('beforeend', `<a href="${cd.web_url}" class="btn btn-success">${cd.pulls_url ?? 'main'}</a>`));
          //         //     if (data.codespaces.length <= 0) {
          //         //         // Codespaces:
          //         //         //   None is found, we propose to create one:
          //         //         //
          //         //         //   see https://docs.github.com/en/rest/codespaces/codespaces#create-a-codespace-for-the-authenticated-user
          //         //         //
          //         //         this.el.codespaces.insertAdjacentHTML('beforeend', `
          //         //     <a class="btn btn-warning">New!</a>
          //         // `);
          //         //     this.el.codespaces.querySelector('a').addEventListener('click', () => {
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
        )
        .catch(() => true), // TODO: not clean
    ]).then((data) => {
      this.removeAttribute("running");
      return data;
    });
  }
}

customElements.define(XRepository.tag, XRepository);
