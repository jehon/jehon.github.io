
import "./x-repository.js";
import "./x-img.js";

const timestampEl = document.querySelector('#timestamp');
const timeUTCEl = document.querySelector('#time');

setInterval(() => {
    timeUTCEl.innerHTML = (new Date()).toISOString().substring(11, 19) + " UTC";
}, 1000);

let refreshCron = 0;
export async function refresh() {
    if (refreshCron) {
        clearTimeout(refreshCron)
    }
    refreshCron = setTimeout(() => refresh(), 5 * 60 * 1000);

    timestampEl.innerHTML = (new Date()).toTimeString().split(' ')[0];

    return Promise.all(Array.from(document.querySelectorAll('x-repository')).map(el => el.refreshData()));
}

document.refresh = refresh;
refresh();

timestampEl.addEventListener('click', () => refresh());

document.querySelectorAll('[copy-to-clipboard]').forEach(e => e.addEventListener("click", e => {
    const txt = e.target.innerHTML;
    navigator.clipboard.writeText(txt);
}));
