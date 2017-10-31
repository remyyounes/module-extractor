const path = require('path')
const fs = require('fs-extra')

const debug = x => {
  console.log(x)
  return x
}

const tryFile = file => {
  try {
    return fs.existsSync(file) && file
  } catch (e) {
    return undefined
  }
}
const tryExtensions = extensions => file => extensions.reduce(
  (acc, ext) => acc ? acc : tryFile(file + ext),
  undefined
)

const readFile = path => {
  return new Promise((resolve, reject) => {
    fs.lstat(path, (err, stats) => {
      if (err) {
        reject(err)
        return
      }
      if (stats.isDirectory()) { return }
      if (stats.isFile()) {
        fs.readFile(path, 'utf-8', (err, content) => {
          if (err) {
            reject(err)
            return
          }
          resolve(content)
        })
      }
    })
  })
}
const fromPath = (dir, sources) => sources.map(file => path.join(dir, file))

const extractNpmDependencies = path => {
  const packageConfig = require(path)
  return Object.keys(packageConfig.dependencies)
}

const getAbsolutePathFromfile = file => relativePath =>
  path.resolve(path.join(path.dirname(file), relativePath))


module.exports = {
  debug,
  extractNpmDependencies,
  fromPath,
  getAbsolutePathFromfile,
  getDir: path.dirname,
  readFile,
  tryExtensions,
  tryFile,
}
