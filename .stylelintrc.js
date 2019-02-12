module.exports = {
  plugins: ['stylelint-scss'],
  extends: [
    'stylelint-config-recess-order',
    'stylelint-config-standard',
    './node_modules/prettier-stylelint/config.js'
  ],
  ignoreFiles: [
    '**/node_modules/**'
  ],
  rules: {
    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': true
  }
}
