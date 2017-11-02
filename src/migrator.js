const path = require('path')
const fs = require('fs-extra')
const memFs = require('mem-fs')
const editor = require('mem-fs-editor')
const { taskDone } = require('./lib.js')

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

module.exports = {
  exportToDestination,
  bootstrapClient,
}
