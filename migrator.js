const path = require('path')
const fs = require('fs')

const exportToDestination = (source, destination) => files => {
  files.map(absolutePath => {
    const relativePath = absolutePath.replace(source, '')

    return fs.copySync(
      absolutePath,
      path.join(destination, relativePath)
    )
  })
}

module.exports = {
  exportToDestination,
}
