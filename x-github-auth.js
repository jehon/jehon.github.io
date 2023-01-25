
import { Octokit } from "https://cdn.skypack.dev/@octokit/rest";
import { createTokenAuth } from "https://cdn.skypack.dev/@octokit/auth-token";
import { throttling } from "https://cdn.skypack.dev/@octokit/plugin-throttling";
import { retry } from "https://cdn.skypack.dev/@octokit/plugin-retry";

const tokenHolder = 'jhDevToken';

function getToken() {
    return localStorage[tokenHolder] ?? '';
}

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

const ockokitAuthConfig = {
    authStrategy: () => createTokenAuth(getToken()),
    //    auth: getToken()
}

const octokit = new (Octokit.plugin(throttling).plugin(retry))({
    ...(getToken() ? ockokitAuthConfig : {}),
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
});
export default octokit;

class XGithubAuth extends HTMLElement {
    static get tag() {
        return "x-github-auth";
    }

    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        if (!getToken()) {
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
            const input = this.shadowRoot.querySelector('[name=token]');
            input.addEventListener('change', () => {
                const v = input.value.trim();
                if (v) {
                    localStorage[tokenHolder] = v;
                    this.shadowRoot.innerHTML = 'Token loaded, please reload the page';
                }
            });
        }
    }
}
customElements.define(XGithubAuth.tag, XGithubAuth);
