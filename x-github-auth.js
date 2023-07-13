
//
// https://github.com/octokit/authentication-strategies.js/
//  ==> token https://github.com/settings/tokens/new
//

import { Octokit } from "https://esm.sh/@octokit/rest";
import { createTokenAuth } from "https://esm.sh/@octokit/auth-token";

const tokenHolder = "jhDevToken";

function getToken() {
  return localStorage[tokenHolder] ?? "";
}

//
// https://github.com/octokit/auth-app.js#usage-with-octokit
//

//
// https://github.com/octokit/authentication-strategies.js/
//  ==> token https://github.com/settings/tokens/new
//

const ockokitAuthConfig = {
  authStrategy: () => createTokenAuth(getToken()),
};

export default octokit = new Octokit({
  ...(getToken() ? ockokitAuthConfig : {}),
  userAgent: "jehon personal dashboard",
});

export class XGithubAuth extends HTMLElement {
  static get tag() {
    return "x-github-auth";
  }

  connectedCallback() {
    this.attachShadow({ mode: "open" });
    if (getToken()) {
      this.shadowRoot.innerHTML = "<slot></slot>";
    } else {
      // We need to authenticate!
      this.shadowRoot.innerHTML = `
                <style>
                    ${XGithubAuth.tag} {
                        display: block;
                    }
                </style>
                <div>Please go to <a href='https://github.com/settings/tokens/new'>GITHUB</a> to create a token</div>
                <div>
                    <input name='token'>
                </div>
            `;
      const input = this.shadowRoot.querySelector("[name=token]");
      input.addEventListener("change", () => {
        const v = input.value.trim();
        if (v) {
          localStorage[tokenHolder] = v;
          this.shadowRoot.innerHTML = "Token loaded, please reload the page";
        }
      });
    }
  }
}
customElements.define(XGithubAuth.tag, XGithubAuth);
