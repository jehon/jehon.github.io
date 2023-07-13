
//
// https://github.com/octokit/authentication-strategies.js/
//  ==> token https://github.com/settings/tokens/new
//

import { Octokit } from "https://esm.sh/@octokit/rest";
import { createTokenAuth } from "https://esm.sh/@octokit/auth-token";
// import { throttling } from "https://esm.sh/@octokit/plugin-throttling";
// import { retry } from "https://esm.sh/@octokit/plugin-retry";

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

// (Octokit.plugin(throttling).plugin(retry))
export default octokit = new Octokit({
  ...(getToken() ? ockokitAuthConfig : {}),
  // throttle: {
  //   onRateLimit: (retryAfter, options) => {
  //     octokit.log.warn(
  //       `Request quota exhausted for request ${options.method} ${options.url}`
  //     );

  //     if (options.request.retryCount === 0) {
  //       // only retries once
  //       octokit.log.info(`Retrying after ${retryAfter} seconds!`);
  //       return true;
  //     }
  //   },
  //   onSecondaryRateLimit: (retryAfter, options) => {
  //     // does not retry, only logs a warning
  //     octokit.log.warn(
  //       `Secondary rate limit detected for request ${options.method} ${options.url}`
  //     );
  //   },
  //   onAbuseLimit: (retryAfter, options) => {
  //     // does not retry, only logs a warning
  //     octokit.log.warn(
  //       `Abuse detected for request ${options.method} ${options.url}`
  //     );
  //   },
  // },
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
