
const config = {};

try {
    Object.assign(config, await fetch("devstack/dev-config.json")
        .then(response => response.json(), () => null)
        );
} catch(_e) {
    // ok
}

// export default config;

// Thanks to https://stackoverflow.com/a/56253298/1954789
function flattenObj(obj, parent, res = {}) {
    for (let key in obj) {
        let propName = parent ? parent + '.' + key : key;
        if (typeof obj[key] == 'object') {
            flattenObj(obj[key], propName, res);
        } else {
            res[propName] = obj[key];
        }
    }
    return res;
}
const flattenConfig = flattenObj(config);

export const inject = (string) => string.replace(
    /\{\{([0-9a-zA-Z_.]+)\}\}/g,
    (full, name) => flattenConfig[name] ?? ""
)
