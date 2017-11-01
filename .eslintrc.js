module.exports = {
  "extends": "airbnb-base",
  "rules": {
    // enable additional rules
    "arrow-body-style": "off",
    "arrow-parens": "off",
    "semi": ["error", "never"],
    "no-undef": "error",
    // override default options for rules from base configurations
    "comma-dangle": ["error", "always-multiline"],
    "no-cond-assign": ["error", "always"],
    "no-confusing-arrow": ["off", {"allowParens": true}],
    "no-unneeded-ternary": "off",
    "global-require": "off",
    // disable rules from base configurations
    "no-console": "off",
    "function-paren-newline": "off",
  }
}
