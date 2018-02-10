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
const dependencies = getDependencies(migratorConfig.entryPoints)
  .then(deps => deps.concat(filterValid(getTests(deps))))
  .then(concat(migratorConfig.entryPoints))
  .then(concat(migratorConfig.extraFiles))
  .then(sort)

if (migratorConfig.debug) {
  // Log dependencies on Dry runs
  dependencies
    .then(map(debug))
    .then(x => debug(x.length))
} else {
  // NEW FILES
  // Generate extra files from Templates

  // OLD FILES
  // Copy Files
  dependencies
    .then(
      exportToDestination(
        migratorConfig.rootDir,
        migratorConfig.destinationDir
      )
    ).then( ()  => {
      bootstrapClient(
        `${migratorConfig.rootDir}/src`,
        migratorConfig.entryPoints
      ).then(concat([
        './templates/src/index.js',
        './templates/webpack.config.js',
        './templates/webpack.dev.config.js',
        './templates/.babelrc',
        './templates/scripts/componentUsage.js',
        './templates/scripts/single-test.sh',
      ])).then(
        exportToDestination(
          './templates/',
          migratorConfig.destinationDir
        )
      ).then(() => processPackageJson(migratorConfig))
    })
}
