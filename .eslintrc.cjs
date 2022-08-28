module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: ['eslint:recommended', 'airbnb-base'],
    overrides: [
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    settings: {
        'import/resolver': {
            node: true,
            alias: {
                map: [
                    ['~', process.cwd()],
                    ['@', './src'],
                ],
                extensions: ['.js', '.json'],
            },
        },
    },
    rules: {
        indent: [
            'error',
            4,
        ],
        'linebreak-style': [
            'error',
            'unix',
        ],
        quotes: [
            'error',
            'single',
        ],
        semi: [
            'error',
            'never',
        ],
        'no-unused-vars': 'warn',
        'import/no-cycle': 'off',
        'no-restricted-syntax': 'off',
        'max-classes-per-file': 'off',
        'no-constructor-return': 'off',
        'no-param-reassign': ['error', { props: false }],
        'no-shadow': 'off',
    },
}
