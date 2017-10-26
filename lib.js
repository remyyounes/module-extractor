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
const tryExtensions = extensions => path => extensions.reduce(
  (acc, ext) => acc ? acc : tryFile(path + ext),
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


const getAbsolutePathFromfile = file => relativePath =>
  path.resolve(path.join(path.dirname(file), relativePath))

const isLocalImport = filepath => filepath.includes('/')


module.exports = {
  debug,
  getAbsolutePathFromfile,
  getDir: path.dirname,
  isLocalImport,
  readFile,
  tryExtensions,
  tryFile,
}
