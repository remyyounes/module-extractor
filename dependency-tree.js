const acorn = require('acorn/dist/acorn_loose')
const path = require('path')
const walk = require('acorn/dist/walk')
const {
  map,
  uniq,
  filter,
  flatten,
  concat,
  pipeP,
} = require('ramda')
const { readFile, tryExtensions } = require('./lib.js')

// UTILS
const filterImports = filter(x => x)
const mapP = mapFunction => list => Promise.all(list.map(mapFunction))

const parse = code =>
  acorn.parse_dammit(code, { sourceType: 'module' })

const extractImports = code => {
  const imports = []
  walk.simple(
    parse(code),
    {
      ImportDeclaration(n) {
        imports.push(n.source.value)
      },
      CallExpression(n) {
        if (n.callee.name === 'require') {
          imports.push(n.arguments[0].value)
        }
      },
    }
  )
  return imports
}

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
  const resolver = module => dependency => {
    const sources = packages.includes(dependency)
      ? []
      : [path.dirname(module)].concat(alternatePaths)
    return resolveFile(
      tryExtensions(extensions),
      sources,
      dependency
    )
  }
  const VISITED = {}
  const getDependencies = async file => {
    // skip or visit
    if (VISITED[file]) { return [] }
    VISITED[file] = true

    // Async Pipeline
    return pipeP(
      readFile,
      extractImports,
      map(resolver(file)),
      filterImports,
      imports => mapP(getDependencies)(imports).then(concat(imports)),
      flatten,
      uniq
    )(file)
  }

  return getDependencies
}

module.exports = {
  configureResolver,
}
