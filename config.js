const path = require('path')

// MIGRATION CONFIGURATION

const wrench = '/Users/remyy/Applications/ruby/procore/wrench/'
const hydra = '/Users/remyy/Applications/ruby/procore/hydra_clients/'
const tool = 'budgetViewer'

// we currently only parse JS files because that's what acorn supports
// Because we can't extract imgage imports from those CSS files
// We need to hard code the paths in extraFiles
const extraFiles = [
  path.join(wrench, 'src', 'assets'),
]

// Mount points you want to migrate to hydra
// The dependency crawling will start from these files
const entryPoints = [
  path.join(wrench, 'src/tools/photos/mounts/Photos.jsx'),
]

const migratorConfig = {
  hydra,
  entryPoints,
  extraFiles,
  rootDir: wrench,
  destinationDir: path.join(hydra, tool),
  debug: true,
}

// CUSTOM RESOLVER CONFIGURATION

// The current resolver is not smart enough to resolve in these paths
// Depending on your tool needs, specify extra paths
const alternatePaths = [
  `${wrench}/src/_shared`, // magic resolve in our webpack config
]

// TODO:
const packageJson = '/Users/remyy/Applications/ruby/procore/wrench/package.json'
const packageConfig = require(packageJson)
const packages = Object.keys(packageConfig.dependencies)

const resolverConfig = {
  alternatePaths,
  packages,
  extensions: [
    '/index.jsx',
    '/index.js',
    '.jsx',
    '.js',
    '.scss',
    '.css',
    '', // in case the extension is already provided
  ],
}

module.exports = {
  migratorConfig,
  resolverConfig,
}
