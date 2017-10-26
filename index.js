const path = require('path')
const { exportToDestination } = require('./migrator.js')
const dt = require('./dependency-tree.js')
const { concat } = require('ramda')
const { debug } = require('./lib.js')

const packageJson = '/Users/remyy/Applications/ruby/procore/wrench/package.json'
const packageConfig = require(packageJson)
const packages = Object.keys(packageConfig.dependencies)
const rootDir = '/Users/remyy/Applications/ruby/procore/wrench/'

const entryPoint = path.join(
  rootDir,
  'src/tools/budgetViewer/mounts/ProjectLevel/View.js'
)

const getDependencies = dt({
  packages,
  extensions: [
    '/index.jsx',
    '/index.js',
    '.jsx',
    '.js',
    '.scss',
    '.css',
    '',
  ],
  alternatePaths: [
    `${rootDir}/src/_shared`,
  ],
})

const extraFiles = [
  entryPoint,
  path.join(rootDir, 'src', 'assets'),
]


const dependencies = getDependencies(entryPoint)

dependencies
  .then(x => x.map(debug))
  .then(x => debug(x.length))

const destinationRoot = '/Users/remyy/Applications/ruby/procore/hydra_clients/budget/'
dependencies
  .then(concat(extraFiles))
  .then(exportToDestination(rootDir, destinationRoot))
