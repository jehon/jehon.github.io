class CI extends HTMLElement {
  static get tag() {
    return "x-ci";
  }

  connectedCallback() {
    const project = this.getAttribute("project");
    const branch = this.getAttribute("branch");

    this.style.gridRow = project.replaceAll("/", "_");
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

customElements.define(CI.tag, CI);

document
  .querySelector("#reload")
  .addEventListener("click", () => location.reload());
