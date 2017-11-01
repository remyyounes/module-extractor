const { bootstrapClient, exportToDestination } = require('./migrator.js')
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

const getUsedNpmPackages = (config) => () => {
  const usedNpm = config.NPM.reduce(
    (acc, entry) => {
      const version = config.packageEntries[entry]
      return version
        ? Object.assign(acc, { [entry]: version })
        : acc
    }, {}
  )
  return usedNpm
}

if (migratorConfig.debug) {
  // Log dependencies on Dry runs
  dependencies
    .then(getUsedNpmPackages(resolverConfig))
    .then(usedNpmPackages => console.log(JSON.stringify(usedNpmPackages).split(',').join(',\n')))
  //   .then(x => x.map(debug))
  //   .then(x => debug(x.length))
} else {
  // Migrate dependencies
  dependencies
    .then(
      exportToDestination(
        migratorConfig.rootDir,
        migratorConfig.destinationDir
      )
    )
    .then(
      () => bootstrapClient(
        `${migratorConfig.rootDir}/src`,
        migratorConfig.entryPoints
      )
    )
}
