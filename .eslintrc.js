module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'import/no-named-as-default': 0,
    'import/no-named-as-default-member': 0,
    'arrow-parens': ['error', 'as-needed'],
    'operator-linebreak': ['error', 'after'],
    'no-param-reassign': ['error', { props: false }],
    'no-return-assign': 0,
    'object-curly-newline': 0,
    'prefer-destructuring' : 0,
    'no-restricted-globals': 0,
  },
};