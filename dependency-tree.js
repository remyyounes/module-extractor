const acorn = require('acorn/dist/acorn_loose')
const path = require('path')
const walk = require('acorn/dist/walk')
const { uniq, flatten } = require('ramda')
const { readFile, tryExtensions } = require('./lib.js')

const addToImports = (resolver, imports, file, importStatement) => {
  const resolved = resolver(file, importStatement)
  if (resolved) {
    imports.push(resolved)
  }
  return imports
}

const extractImports = (resolver, file) => code => new Promise(resolve => {
  let imports = []
  try {
    const ast = acorn.parse_dammit(
      code,
      {
        sourceType: 'module',
      }
    )

    walk.simple(ast, {
      ImportDeclaration(n) {
        imports = addToImports(resolver, imports, file, n.source.value)
      },
      CallExpression(n) {
        if (n.callee.name === 'require') {
          imports = addToImports(resolver, imports, file, n.arguments[0].value)
        }
      },
    })
  } catch (e) {
    // console.log("TODO:", 'deal with errors', e)
  }
  resolve(imports)
})

const PROCESSED_REMOVE_ME = {}

const getDependencies = resolver => async file => {
  if (PROCESSED_REMOVE_ME[file]) {
    return []
  }
  PROCESSED_REMOVE_ME[file] = true
  return readFile(file)
    .then(extractImports(resolver, file))
    .then(getSubDependencies(resolver))
}
const getSubDependencies = resolver => imports =>
  Promise.all(imports.map(getDependencies(resolver)))
    .then(flatten)
    .then(flattened => flattened.concat(imports))
    .then(uniq)

const resolveFile = (resolver, sources, dependency) =>
  sources.reduce(
    (acc, directory) =>
      acc || resolver(path.resolve(path.join(directory, dependency))),
    false
  )

const configureResolver = ({
  extensions = ['.js'],
  packages = [],
  alternatePaths = [],
}) => {
  const resolver = tryExtensions(extensions)

  return (module, dependency) => {
    const sources = packages.includes(dependency)
      ? []
      : [path.dirname(module)].concat(alternatePaths)
    return resolveFile(resolver, sources, dependency)
  }
}

module.exports = {
  configureResolver,
  getDependencies,
}
