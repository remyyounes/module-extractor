const dt = require('./src/dependency-tree.js')
const {
  bootstrapClient,
  exportToDestination,
  processPackageJson,
} = require('./src/migrator.js')
const { concat, flatten, uniq } = require('ramda')
const { debug } = require('./src/lib.js')
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
  .then(uniq)

if (migratorConfig.debug) {
  // Log dependencies on Dry runs
  dependencies
    .then(x => x.map(debug))
    .then(x => debug(x.length))

    // PACKAGE.JSON Dependency Injection
    // 1 find wrench package.json
    // 2 get devDeps and dependencies
    // 3 find new hydra package.json
    // 4 replace hydra deps with wrench deps


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
    .then(
      exportToDestination(
        migratorConfig.rootDir,
        migratorConfig.destinationDir
      )
    )

    // const testFiles = getAllTests()
    // const relevantTests = parseForRelevantTests(testFiles)
    // 1 parse test file to AST
    // 2 check if imports are in "dependencies"
    // 3 if they are, return path
    // 4 resolve paths returned from parsing
    // 5 copy relevantTests
}
