// Eventually move this to a configuration file
// .module-extractor.rc
const config = {
  // sourceDir: '/Users/remyy/Applications/ruby/procore/',
  sourceDir: '/Users/georgemichael/Code/Procore/procore',
  destinationDir: 'budgetViewer',
  toolRoot: 'src/tools/budgetViewer',
  extraFiles: [
    // NOTE: replace this line with the provider that you use!
    // 'src/_shared/decorators/sagaProvider/__tests__/MockComponent.jsx',
  ],
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
const wrenchPackageJson = path.join(wrench, 'package.json')
const packages = extractNpmDependencies(wrenchPackageJson)

// extraFiles
// ==========
// we currently only parse JS files because that's what acorn supports
// Because we can't extract imgage imports from those CSS files
// We need to hard code the paths in extraFiles

const extraFiles = [
  'src/assets',
  'src/_shared/tests',
  '.env',
  '.eslintrc',
  '.eslintignore',
  '.gitignore',
  '.mocha.opts',
  'yarn.lock',
  '.hound.yml',
  config.toolRoot,
].concat(config.extraFiles)


// entryPoints
// ==========
// Mount points you want to migrate to hydra
// The dependency crawling will start from these files

const migratorConfig = {
  hydra,
  entryPoints: fromPath(wrench, config.entryPoints),
  extraFiles: fromPath(wrench, extraFiles),
  rootDir: wrench,
  destinationDir: path.join(hydra, config.destinationDir),
  // debug: true,
}

// CUSTOM RESOLVER CONFIGURATION
// =============================
// The current resolver is not smart enough to resolve in these paths
// Depending on your tool needs, specify extra paths

const resolverConfig = {
  alternatePaths: fromPath(wrench, ['src']),
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
