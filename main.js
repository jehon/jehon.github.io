
import "./x-repository.js";
import "./x-img.js";

let refreshCron = 0;
export async function refresh() {
    if (refreshCron) {
        clearTimeout(refreshCron)
    }
    refreshCron = setTimeout(() => refresh(), 5 * 60 * 1000);

    return Promise.all(Array.from(document.querySelectorAll('x-repository')).map(el => el.refreshData()));
}

document.refresh = refresh;

refresh();
