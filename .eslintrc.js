
module.exports = {
    root: true,
    extends: [
        'eslint:recommended'
    ],
    sourceType: 'module',
    env: {
        es6: true,
        browser: true
    },
    rules: {
        indent: [
            'error',
            4,
            {
                SwitchCase: 1
            }
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        quotes: [
            'error',
            'single'
        ],
        semi: [
            'error',
            'always'
        ],
        'no-unused-vars': [
            'error',
            {
                vars: 'local',
                varsIgnorePattern: '^_',
                argsIgnorePattern: '^_'
            }
        ],
        'no-console': [
            'error',
            {
                allow: [
                    'warn',
                    'error',
                    'info',
                    'assert'
                ]
            }
        ],
        'no-trailing-spaces': [
            'error'
        ],
        'no-warning-comments': 'off',
        'quote-props': [
            'warn',
            'as-needed'
        ]
    }
};