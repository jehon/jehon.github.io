/* globals gapi, chrome */

// https://developers.google.com/workspace/guides/auth-overview
// https://developers.google.com/gmail/api/quickstart/js

//
// Configure at 
//    https://console.developers.google.com/
//

// Client ID and API key from the Developer Console
const gapi_client_id = "373603847380-uae3tg7m95ehtblu7o3s5tanmebji9ka.apps.googleusercontent.com";
// Array of API discovery doc URLs for APIs
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/gmail.modify';

const minAgeYears = 2;

const logElement = document.querySelector('#log');
const authorizeButton = document.querySelector('button#gapi-authorize');
const signoutButton = document.querySelector('button#gapi-signout');

/**
 * Log infos to html
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

const statsElements = document.querySelector('.stats');
/**
 * Add an element to the page (stat section)
 */
function reportToPage(title, value) {
    const el = document.createElement('div')
    el.innerHTML = `<span>${title}</span><span>${value}</span>`;
    statsElements.insertAdjacentElement('beforeend', el);
    return el;
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
            reportToPage('Username', response.result.emailAddress);
        });
        gapi.client.gmail.users.getProfile({
            userId: 'me'
        }).then(response => {
            reportToPage('Nb messages', response.result.messagesTotal);
            reportToPage('Nb threads', response.result.threadsTotal);

            // Start the job
            startAnalysis();
        });

    } else {
        info("Not connected");
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
    }
}

/**
 * All the labels used in the GMail
 */
let labelsList = {};

/**
 * id of the label "_delete"
 */
let labelDelete = '';

/**
 * Start the real analysis
 */
function startAnalysis() {
    //
    // Get all the labels (id => name)
    //
    return gapi.client.gmail.users.labels.list({
        userId: 'me',
        // maxResults: 200
    })
        .then(response => response.result)
        .then(result => {
            result.labels.forEach((v) => {
                labelsList[v.id] = v.name;
                if (v.name == '_delete') {
                    labelDelete = v.id;
                }
            })

            if (!labelDelete) {
                info("You don't have the '_delete' label set: ", Object.values(labelsList).sort().join(', '));
                return;
            }

            reportToPage('Deleted label', labelDelete);
            generateMessages();
        })
}

/**
 * Get all the messages by search
 * 
 * @param {string} fromPage? for multipages 
 * @returns 
 */
function generateMessages(fromPage = '') {
    // https://developers.google.com/gmail/api/v1/reference/users/threads/list
    return gapi.client.gmail.users.threads.list({
        userId: 'me',
        includeSpamTrash: false,
        maxResults: 25,
        q: `older_than:${minAgeYears}y`,
        pageToken: fromPage
    })
        .then(response => response.result)
        .then(async result => {
            info(`Got message list: ${result.threads.length} with ${result.nextPageToken} for next page`)
            // https://developers.google.com/gmail/api/v1/reference/users/threads#resource
            for (const t of result.threads) {
                await handleThread(t);
            }
            // TODO: take next page
            // await generateMessages(result.nextPageToken);
        });
}

/**
 * Handle a thread:
 *    - if no labels, mark it with "deletedLabel"
 * 
 * @param {thread} shortThread 
 * @returns 
 */
function handleThread(shortThread) {
    // https://developers.google.com/gmail/api/v1/reference/users/threads/get
    return gapi.client.gmail.users.threads.get({
        userId: 'me',
        id: shortThread.id,
        format: 'metadata'
    })
        .then(response => response.result)
        .then(async thread => {

            // function getAllLabelsForThread(thread) {
            let labelSet = new Set();
            thread.messages.forEach(el => {
                if (el.labelIds) labelSet.add(...el.labelIds);
            })
            const labels = Array.from(labelSet)
                .filter(l => !['SENT'].includes(l))
                .filter(l => !l.startsWith('CATEGORY_'))

            const msg = {
                labels,
                amount: thread.messages.length,
                lastMessageDateRaw: thread.messages.map(v => v.internalDate).pop(),
                lastMessageDate:
                    (
                        new Date(
                            parseInt(thread.messages.map(v => v.internalDate).pop())
                        )
                    ).toISOString(),
                subject: thread.messages[0].payload.headers.filter(f => f.name == 'Subject')[0].value,
            }

            if (labels.length == 0) {
                // use "info(...)"
                info(`Mark ${msg.subject} (#${msg.amount}) at ${msg.lastMessageDate}`);

                //
                // Mark the message with the deletedLabel
                //
                // https://developers.google.com/gmail/api/reference/rest/v1/users.threads/modify
                return gapi.client.gmail.users.threads.modify({
                    userId: 'me',
                    id: thread.id,
                }, { "addLabelIds": [labelDelete] })
            }
        });
}
