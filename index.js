const path = require('path')
const { exportToDestination } = require('./migrator.js')
const dt = require('./dependency-tree.js')
const { concat, flatten } = require('ramda')
const { debug, mapP } = require('./lib.js')

const packageJson = '/Users/remyy/Applications/ruby/procore/wrench/package.json'
const packageConfig = require(packageJson)
const packages = Object.keys(packageConfig.dependencies)
const rootDir = '/Users/remyy/Applications/ruby/procore/wrench/'


const config = {
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
}
const getDependencies = dt(config)


const entryPoint = path.join(
  rootDir,
  'src/tools/budgetViewer/mounts/ProjectLevel/View.js'
)

const entryPoints = [
  path.join(rootDir, 'src/tools/budgetViewer/mounts/projectLevel/View.js'),
  path.join(rootDir, 'src/tools/budgetViewer/mounts/projectLevel/DeleteSnapshot.js'),
  path.join(rootDir, 'src/tools/budgetViewer/mounts/projectLevel/CreateSnapshot.js'),
  path.join(rootDir, 'src/tools/budgetViewer/mounts/companyLevel/Edit.js'),
  path.join(rootDir, 'src/tools/budgetViewer/mounts/companyLevel/Create.js'),
]

const dependencies = Promise.all(entryPoints.map(getDependencies))
  .then(flatten)

dependencies
  .then(x => x.map(debug))
  .then(x => debug(x.length))

// const destinationRoot = '/Users/remyy/Applications/ruby/procore/hydra_clients/budget/'
// const extraFiles = [
//   entryPoint,
//   path.join(rootDir, 'src', 'assets'),
// ]
// dependencies
//   .then(concat(extraFiles))
//   .then(exportToDestination(rootDir, destinationRoot))
