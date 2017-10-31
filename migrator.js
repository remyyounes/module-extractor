const path = require('path')
const fs = require('fs-extra')

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

const toImport = source => entry => {
  const name = toName(entry)
  return `import ${name} from "${entry.replace(source, '.')}"`
}


const bootstrapClient = (source, entryPoints) => {
  // read indexTemplate
  const template = fs.readFileSync('./appTemplate.jsx').toString()
  // generate imports
  const imports = entryPoints.map(toImport(source)).join('\n')
  // generate component lookup hash
  const components = `${entryPoints.map(toName).join(',\n  ')}`
  const componentHash = `const components = {\n  ${components}\n}\n`
  // concat content
  const content = `${imports}\n${componentHash}\n${template}`

  // write to app.js
  fs.writeFileSync('./src/App.jsx', content)
}

module.exports = {
  exportToDestination,
  bootstrapClient,
}
