const path = require('path')

// MIGRATION CONFIGURATION

const wrench = '/Users/georgemichael/Code/Procore/wrench/'
const hydra = '/Users/georgemichael/Code/Procore/procore/hydra_clients'
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
  path.join(wrench, 'src/tools/budgetViewer/mounts/projectLevel/View.js'),
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

// TODO: move npm deps to lib file
const packageJson = path.join(wrench, 'package.json');
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
