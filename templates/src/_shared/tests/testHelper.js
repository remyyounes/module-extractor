// These are currently set in webpack.config.js. They need to be set here
// because running tests does not go through webpack at all. In the future,
// these should be injected.
global.__NODE_ENV__ = JSON.stringify(process.env.NODE_ENV);

import path from 'path';
import chai from 'chai';
import chaiImmutable from 'chai-immutable';
import { jsdom } from 'jsdom';
import hook from 'css-modules-require-hook';
import sass from 'node-sass';
import register from 'ignore-styles'

// Ignore CSS styles
register(['.css']);

// Have mocha ignore SVGs
const exportEmptyString = module => module.exports = '';
require.extensions['.svg'] = exportEmptyString;

hook({
  extensions: [ '.scss', '.sass' ],
  generateScopedName: '[local]',  // Don't scope names so it's easier to test
  preprocessCss: (css, filepath) => {
    const result = sass.renderSync({
      data: css,
      includePaths: [ path.resolve(filepath, '..') ],
    });
    return result.css;
  },
});

const exposedProperties = ['window', 'navigator', 'document'];

global.document = jsdom('<!doctype html><meta name="csrf-token" content="csrf-foo"><html><body></body></html>', {
  url: 'http://localhost',
});

global.window = document.defaultView;

const $ = (selector) => {
  let methods = {};

  if (selector === 'meta[name="csrf-token"]') {
    methods = {
      ...methods,
      attr: (attribute) => {
        if (attribute === 'content') return 'TEST_CSRF_TOKEN';
        return null;
      },
    };
  }

  return methods;
};

Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});

global.storage = {};

global.localStorage = {
  getItem: key => global.storage[key],
  setItem: (key, value) => { global[key] = value; }
}

global.window = {

  ... global.window,

  HTMLIFrameElement: () => {},

  location: {
    search: '',
    href: '?',
  },

  $,

  Procore: {
    Environment: { currencySymbol: '$' },
    Util: {
      isIELTE9() { return false; },
    },
  },

  matchMedia() {
    return {
      matches: false,
      addListener() {},
      removeListener() {},
    };
  },
};

global.navigator = { userAgent: 'node.js' };
global.I18n = { t(translationPath) { return translationPath } };

chai.use(chaiImmutable);
chai.config.truncateThreshold = 0;
