/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    "@remix-run/eslint-config",
    "@remix-run/eslint-config/node",
    "plugin:@cazoo/eslint/react",
  ],
  rules: {
    "react/react-in-jsx-scope": "off",
  },
};
