const acorn = require('acorn/dist/acorn_loose')
const path = require('path')
const walk = require('acorn/dist/walk')
const { debug, readFile, tryExtensions } = require('./lib.js')
const {
  map,
  uniq,
  filter,
  flatten,
  concat,
  pipeP,
} = require('ramda')

// UTILS
const filterImports = filter(x => x)

const mapP = mapFunction => list => Promise.all(list.map(mapFunction))
const traverseAndMerge = traverse => list => pipeP(
  mapP(traverse),
  concat(list),
  flatten,
  uniq
)(list)

// tmp hack
const transpile = code => code.replace(
  /export (.)* from/,
  'import default from'
)
const parse = code =>
  acorn.parse_dammit(
    transpile(code),
    { sourceType: 'module' }
  )

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

const isNpm = (cfg, dependency) => {
  if (cfg.packages.includes(dependency)) {
    if (!cfg.NPM.includes(dependency)) {
      cfg.NPM.push(dependency)
    }
    return true
  }
  return false
}

const configureResolver =
  (cfg) => module => dependency => {
    const sources = isNpm(cfg, dependency)
      ? []
      : [path.dirname(module)].concat(cfg.alternatePaths)
    return resolveFile(
      tryExtensions(cfg.extensions),
      sources,
      dependency
    )
  }

module.exports = config => {
  const resolver = configureResolver(config)
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
      traverseAndMerge(getDependencies)
    )(file)
  }

  return getDependencies
}
