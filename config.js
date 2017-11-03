// Eventually move this to a configuration file
// .module-extractor.rc
const config = {
  // sourceDir: '/Users/remyy/Applications/ruby/procore/',
  sourceDir: '/Users/georgemichael/Code/Procore/procore',
  destinationDir: 'budgetViewer',
  toolRoot: 'src/tools/budgetViewer',
  entryPoints: [
    'src/tools/budgetViewer/mounts/projectLevel/View.js',
    'src/tools/budgetViewer/mounts/projectLevel/CreateSnapshot.js',
    'src/tools/budgetViewer/mounts/projectLevel/DeleteSnapshot.js',
    'src/tools/budgetViewer/mounts/companyLevel/Create.js',
    'src/tools/budgetViewer/mounts/companyLevel/Edit.js',
  ],
}

const path = require('path')
const { fromPath, extractNpmDependencies } = require('./src/lib.js')

// MIGRATION CONFIGURATION

// ASSUMING PROCORE STRUCTURE
const wrench = path.join(config.sourceDir, 'wrench')
const hydra = path.join(config.sourceDir, 'hydra_clients')
const packages = extractNpmDependencies(path.join(wrench, 'package.json'))

// extraFiles
// ==========
// we currently only parse JS files because that's what acorn supports
// Because we can't extract imgage imports from those CSS files
// We need to hard code the paths in extraFiles

const extraFiles = fromPath(
  wrench,
  [
    'src/assets',
    'src/_shared/tests'
    '.env',
    config.toolRoot,
  ]
)
// entryPoints
// ==========
// Mount points you want to migrate to hydra
// The dependency crawling will start from these files
const entryPoints = fromPath(wrench, config.entryPoints)

const migratorConfig = {
  hydra,
  entryPoints,
  extraFiles,
  rootDir: wrench,
  destinationDir: path.join(hydra, config.destinationDir),
  debug: true,
}

// CUSTOM RESOLVER CONFIGURATION
// =============================
// The current resolver is not smart enough to resolve in these paths
// Depending on your tool needs, specify extra paths
const alternatePaths = fromPath(wrench, ['src/_shared'])

const resolverConfig = {
  alternatePaths,
  packageEntries: packages,
  packages: Object.keys(packages),
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
