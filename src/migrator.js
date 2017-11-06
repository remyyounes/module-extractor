const path = require('path')
const fs = require('fs-extra')
const memFs = require('mem-fs')
const editor = require('mem-fs-editor')
const { taskDone } = require('./lib.js')
const { compose, flatten, map, uniq } = require('ramda')

const exportToDestination = (source, destination) => files => {
  files.map(absolutePath => {
    const relativePath = absolutePath.replace(source, '')

    return fs.copySync(
      absolutePath,
      path.join(destination, relativePath)
    )
  })
}

const toName = entry => path.basename(entry).split('.')[0]
const toRelative = (source, entry) => entry.replace(source, '.')
const toImport = source => entry => ({
  name: toName(entry),
  source: toRelative(source, entry),
})


const processPackageJson = (config) => {
  const wrenchJsonPath = path.join(config.rootDir, 'package.json')
  const hydraJsonPath = path.join(config.destinationDir, 'package.json')
  const wrenchPackageJson = require(wrenchJsonPath)
  const hydraPackageJson = require(hydraJsonPath)

  hydraPackageJson.dependencies = wrenchPackageJson.dependencies
  hydraPackageJson.devDependencies = Object.assign(
    hydraPackageJson.devDependencies,
    wrenchPackageJson.devDependencies
  )

  hydraPackageJson.scripts.test =
    "neutrino test $(find . -type d -name '__tests__' -not -path '*/node_modules/*')"
  // write back to hydraPackageJson
  fs.writeFileSync(hydraJsonPath, JSON.stringify(hydraPackageJson, null, 2), 'utf8')
}

const bootstrapClient = (source, entryPoints) => new Promise(
  resolve => {
    const store = memFs.create()
    const fileEditor = editor.create(store)
    fileEditor.copyTpl(
      './templates/src/App.ejs',
      './templates/src/App.jsx',
      {
        imports: entryPoints.map(toImport(source)),
        components: entryPoints.map(toName),
      }
    )
    fileEditor.commit(() => {
      taskDone('bootstrapClient')
      resolve(['./templates/src/App.jsx'])
    })
  })

const includes = name => file => file.includes(name)
const getMatchingFiles = (dir, name) =>
  fs.readdirSync(dir).filter(includes(name))

const getTests = compose(
  uniq,
  flatten,
  map(file => {
    const dir = path.dirname(file)
    const name = path.basename(file).split('.')[0]
    const testDir = path.join(dir, '__tests__')
    return fs.existsSync(testDir)
      ? getMatchingFiles(testDir, name).map(f => path.join(testDir, f))
      : null
  })
)
module.exports = {
  exportToDestination,
  bootstrapClient,
  getTests,
  processPackageJson,
}
