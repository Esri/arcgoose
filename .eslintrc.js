module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  extends: ["airbnb-base", "prettier"],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  rules: {
    "import/no-named-as-default": 0,
    "import/no-named-as-default-member": 0,
    "no-param-reassign": ["error", { props: false }],
    "no-return-assign": 0,
    "object-curly-newline": 0,
    "prefer-destructuring": 0,
    "no-restricted-globals": 0,
  },
};
