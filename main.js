
import "./x-repository.js";
import "./x-img.js";

const timestampEl = document.querySelector('#timestamp');

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
