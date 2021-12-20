/* globals gapi, chrome */

// https://developers.google.com/workspace/guides/auth-overview
// https://developers.google.com/gmail/api/quickstart/js

//
// Configure at 
//    https://console.developers.google.com/
//

// Client ID and API key from the Developer Console
const gapi_client_id = "373603847380-uae3tg7m95ehtblu7o3s5tanmebji9ka.apps.googleusercontent.com";
// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/gmail.modify';

const logElement = document.querySelector('#log');
const authorizeButton = document.querySelector('button#gapi-authorize');
const signoutButton = document.querySelector('button#gapi-signout');
const userElement = document.querySelector('#user');
const nbMessagesElement = document.querySelector('#nb-messages');
const nbThreadsElement = document.querySelector('#nb-threads');

/**
 * Log infos to console
 * 
 * @param  {...any} args to be logged
 */
function info(...args) {
    const log = document.createElement('div');
    for (const a of args) {
        if (typeof (a) == 'object') {
            log.innerHTML += JSON.stringify(a, null, 2);
        } else {
            log.innerHTML += a;
        }
    }
    logElement.insertAdjacentElement('beforeend', log);
}

/**
 * Test that we have the secret
 */
const gapi_client_secret = localStorage.jh_gapi_client_secret;
if (!gapi_client_secret) {
    const msg = 'ERROR: no gapi_client_secret found in the localstorage. Use localStorage.jh_gapi_client_secret = "xxx"; to set it';
    info(msg);
    throw new Error(msg);
}

info("gapi_client_secret found");

/**
 *  On load, called to load the auth2 library and API client library.
 */
gapi.load('client:auth2', () => {
    gapi.client.init({
        apiKey: gapi_client_secret,
        clientId: gapi_client_id,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

        // Sign in button
        authorizeButton.onclick = () => gapi.auth2.getAuthInstance().signIn();

        // Sign out button
        signoutButton.onclick = () => gapi.auth2.getAuthInstance().signOut();
    }, function (error) {
        info(error);
    });
});

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        info("Connected");
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';

        gapi.client.gmail.users.getProfile({
            userId: 'me'
        }).then(response => {
            userElement.innerHTML = response.result.emailAddress
        });
        gapi.client.gmail.users.getProfile({
            userId: 'me'
        }).then(response => {
            nbMessagesElement.innerHTML = response.result.messagesTotal;
            nbThreadsElement.innerHTML = response.result.threadsTotal;
        });

        // TODO: start the job
    } else {
        info("Not connected");
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
    }
}

