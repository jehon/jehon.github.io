function project2row(project) {
  return project.replaceAll("/", "_");
}

class CIBranch extends HTMLElement {
  static get tag() {
    return "x-ci-branch";
  }

  connectedCallback() {
    const project = this.getAttribute("project");
    const branch = this.getAttribute("branch");

    this.style.gridColumn = branch;

    this.innerHTML = `
        <a
            href="https://gitlab.redange.fr-team.lu/${project}/-/network/${branch}?ref_type=heads"
            >
            <img
                alt="pipeline status"
                src="https://gitlab.redange.fr-team.lu/${project}/badges/${branch}/pipeline.svg?ignore_skipped=true"
                />
        </a>`;
  }
}
customElements.define(CIBranch.tag, CIBranch);

document
  .querySelector("#reload")
  .addEventListener("click", () => location.reload());

const grid = document.querySelector("#grid");

function addProject(project, branches) {
  grid.insertAdjacentHTML(
    "beforeend",
    `<div style='grid-column: project'>
        ${project}
      </div>
      ${branches
        .map(
          (branch) =>
            `<x-ci-branch project="${project}" branch="${branch}"></x-ci-branch>`
        )
        .join("")}`
  );
}

addProject("focus/devops/db-copy", ["master"]);
addProject("focus/frontend/cms2", ["develop", "main"]);
addProject("focus/frontend/db-manager", ["develop", "master"]);
addProject("olsx/web", ["master"]);
addProject("tools/web-cicd", ["master"]);
addProject("focus/devops/swarm-config", ["master"]);
