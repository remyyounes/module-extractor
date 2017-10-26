const { exportToDestination } = require('./migrator.js')
const dt = require('./dependency-tree.js')
const { concat, flatten } = require('ramda')
const { debug } = require('./lib.js')
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
  .then(concat(migratorConfig.extraFiles))
  .then(concat(migratorConfig.entryPoints))

if (migratorConfig.debug) {
  // Log dependencies on Dry runs
  dependencies
    .then(x => x.map(debug))
    .then(x => debug(x.length))
} else {
  // Migrate dependencies
  dependencies.then(
    exportToDestination(
      migratorConfig.rootDir,
      migratorConfig.destinationRoot
    )
  )
}
