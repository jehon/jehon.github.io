const logElement = document.querySelector('#log');

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

info("Starting", 1, { a: 2 });
