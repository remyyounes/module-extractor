const dt = require('./src/dependency-tree.js')
const {
  bootstrapClient,
  exportToDestination,
  getTests,
  processPackageJson,
} = require('./src/migrator.js')
const {
  map,
  concat,
  flatten,
  uniq,
} = require('ramda')
const { debug, filterValid, sort } = require('./src/lib.js')
const {
  resolverConfig,
  migratorConfig,
} = require('./config.js')

// configure what we do when we find a dependency.
// resolve in this context means constructing the correct path so that we can copy it later
const getDependencies = dt(resolverConfig)

// crawl for dependencies
const dependencies = Promise.all(migratorConfig.entryPoints.map(getDependencies))
  .then(flatten)
  .then(deps => deps.concat(filterValid(getTests(deps))))
  .then(flatten)
  .then(uniq)

if (migratorConfig.debug) {
  // Log dependencies on Dry runs
  dependencies
    .then(concat(migratorConfig.extraFiles))
    .then(uniq)
    .then(sort)
    .then(map(debug))
    .then(x => debug(x.length))
} else {
  // NEW FILES
  // Generate extra files from Templates
  bootstrapClient(
    `${migratorConfig.rootDir}/src`,
    migratorConfig.entryPoints
  ).then(concat([
    './templates/src/index.js',
    './templates/.neutrinorc.js',
  ])).then(
    exportToDestination(
      './templates/',
      migratorConfig.destinationDir
    )
  ).then(() => processPackageJson(migratorConfig))

  // OLD FILES
  // Copy Files
  dependencies
    .then(concat(migratorConfig.extraFiles))
    .then(concat(migratorConfig.entryPoints))
    .then(uniq)
    .then(
      exportToDestination(
        migratorConfig.rootDir,
        migratorConfig.destinationDir
      )
    )
}
