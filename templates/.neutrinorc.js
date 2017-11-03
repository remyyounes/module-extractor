module.exports = {
  options: {
    entry: 'index.js',
    tests: 'src'
  },
  use: [
    'neutrino-preset-react',
    // [
    //   'neutrino-preset-jest',
    //   {
    //     verbose: false,
    //     moduleNameMapper: {
    //       "\\.(css|scss|sass)$": 'identity-obj-proxy'
    //     },
    //     // Shims must be first in the setup array
    //     setupFiles: ['<rootDir>/test-shims.js', '<rootDir>/test-setup.js']
    //   }
    // ],
    ['neutrino-preset-mocha', {
      compilers: 'js:babel-core/register',
      require: [
        'babel-polyfill',
        'src/_shared/tests/testHelper.js',
        'sinon',
      ],
      recursive: true,
      timeout: 10000,
    }],
    ['neutrino-middleware-extract-sass'],
    ['neutrino-preset-hydra-base', { protocol: 'http', host: 'localhost', port: 5000, }],
    ({ config, options }) => {
      config.resolve.modules.add('./src/_shared');

      config.module
        .rule('compile')
        .test( /\.(js|jsx)$/)
        .use('babel')
          .loader('babel-loader')
        .options({
            presets: [
              ["babel-preset-env", {
                "targets": {
                  "browsers": ["last 2 versions"],
                  // "uglify": true
                }
              }],
              "babel-preset-react",
              "babel-preset-stage-0"
            ],
            plugins: ["babel-plugin-transform-decorators-legacy", "babel-plugin-add-module-exports"]
        });

      config.resolve.extensions.add('.css').add('.scss')

      config.when(options.command === 'start', config => {
        config.devServer.headers({ 'Access-Control-Allow-Origin': '*' })
      });
    },
    ['neutrino-middleware-env', ['BASE_URL']]
  ]
}
