const path = require('path')
const { exportToDestination } = require('./migrator.js')
const {
  configureResolver,
} = require('./dependency-tree.js')

// TODO: also copy the following
// - dot files
// - packageJson
// - change ../public reference

// =======
// Config
// =======

// TODO: packagejson
const packageJson = '/Users/remyy/Applications/ruby/procore/wrench/package.json'
const packageConfig = require(packageJson)
const packages = Object.keys(packageConfig.dependencies)
const rootDir = '/Users/remyy/Applications/ruby/procore/wrench/'

const entryPoint = path.join(
  rootDir,
  'src/tools/budgetViewer/mounts/ProjectLevel/View.js'
)

const getDependencies = configureResolver({
  packages,
  extensions: [
    '/index.jsx', '/index.js', '.jsx', '.js', '.scss', '.css',
  ],
  searchPaths: [
    `${rootDir}/src/_shared`,
  ],
})


const dependencies = getDependencies(entryPoint)

// log
dependencies.then(x => console.log(x.length))

// export
// const destinationRoot = '/Users/remyy/Applications/ruby/procore/hydra_clients/budget/'
// dependencies.then(exportToDestination(config.rootDir, config.destinationRoot))
