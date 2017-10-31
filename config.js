const path = require('path')
const { fromPath, extractNpmDependencies } = require('./lib.js')

// MIGRATION CONFIGURATION
const procore = '/Users/remyy/Applications/ruby/procore/'
const tool = 'budgetViewer'

// ASSUMING PROCORE STRUCTURE
const wrench = path.join(procore, 'wrench')
const hydra = path.join(procore, 'hydra_clients')
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
    // configs
    // 'package.json',
    // 'scripts',
    // 'yarn.lock',
    // dotfiles
    // '.babelrc', // neutrino is in charge of delegating to babel
    '.env',
    // '.env_stub',
    // '.eslintignore',
    // '.eslintrc',
    // '.flowconfig',
    // '.github',
    // '.gitignore',
    // '.hound.yml',
    // '.mocha.opts',
    // '.npmignore',
    // '.npmrc',
    // '.nvmrc',
  ]
)
// entryPoints
// ==========
// Mount points you want to migrate to hydra
// The dependency crawling will start from these files
const entryPoints = [
  'src/tools/budgetViewer/mounts/projectLevel/View.js',
  'src/tools/budgetViewer/mounts/projectLevel/CreateSnapshot.js',
  'src/tools/budgetViewer/mounts/projectLevel/DeleteSnapshot.js',
  'src/tools/budgetViewer/mounts/companyLevel/Create.js',
  'src/tools/budgetViewer/mounts/companyLevel/Edit.js',
].map(file => path.join(wrench, file))

const migratorConfig = {
  hydra,
  entryPoints,
  extraFiles,
  rootDir: wrench,
  destinationDir: path.join(hydra, tool),
  debug: true,
}

// CUSTOM RESOLVER CONFIGURATION
// =============================
// The current resolver is not smart enough to resolve in these paths
// Depending on your tool needs, specify extra paths
const alternatePaths = [
  'src/_shared', // magic resolve in our webpack config
].map(file => path.join(wrench, file))

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
