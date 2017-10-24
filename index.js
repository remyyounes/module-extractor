// const analyzeDir = require('./fileReadingUtils.js').analyzeDir;
const fs = require('fs');

const path = require('path');
const { uniq } = require('ramda');
const acorn = require('acorn');
const injectAcornJsx = require('acorn-jsx/inject');
const injectAcornObjectRestSpread = require('acorn-object-rest-spread/inject');
injectAcornJsx(acorn);
injectAcornObjectRestSpread(acorn);
const walk = require('acorn/dist/walk');
const {
  getAbsolutePathFromfile,
  getDir,
  isLocalImport,
  readFile,
  tryExtensions,
  tryFile,
} = require('./lib.js');


// =======
// Config
// =======
const rootDir = '../wrench/';
const entryPoint = 'src/tools/budgetViewer/mounts/ProjectLevel/View.js';



const config = {
  rootDir,
  entryPoint,
  extensions: ['/index.jsx', '/index.js', '.jsx', '.js'],
  localResolver: (config, currentPath, src) => {
    const tryPath = tryExtensions(config.extensions);
    const currentDir = path.dirname(currentPath);
    const localSources = [
      currentDir,
      `${config.rootDir}/src/_shared`,
    ];

    const resolved = localSources.reduce((acc, localSource) => {
      return !!acc
      ? acc
      : tryPath(
        path.resolve( path.join(localSource, src) )
      );
    }, false);
    return resolved;
  },
}

const addToImports = (config, imports, file, importStatement) => {
  const resolved = config.localResolver(config, file, importStatement);
  if ( resolved ) {
    imports.push(resolved);
  }
  return imports;
}


const parseWithAST = (file, code) => new Promise(resolve => {
  const ast = acorn.parse(code,
    {
      sourceType: 'module',
      plugins: {
        objectRestSpread: true,
      },
    }
  );
  let imports = [];

  walk.simple(ast, {
    ImportDeclaration(n){
      imports = addToImports(config, imports, file, n.source.value);
    },
    CallExpression(n){
      if(n.callee.name === 'require'){
        imports = addToImports(config, imports, file, n.arguments[0].value);
      }
    }
  });

  resolve(imports);
});

const getEntry = config => `${config.rootDir}${config.entryPoint}`;

const getRootDependencies = config => {
  const deps = [];
  return deps.concat(getSubDependencies(getEntry(config)));
}

// file = View.jsx
/*
imports =
[ '/Users/remyy/Applications/js/wrench/src/_shared/decorators/sagaProvider/index.js',
  '/Users/remyy/Applications/js/wrench/src/_shared/decorators/bugsnag/index.js',
  '/Users/remyy/Applications/js/wrench/src/tools/budgetViewer/mounts/ProjectLevel/reducers.js',
  '/Users/remyy/Applications/js/wrench/src/tools/budgetViewer/sagas
  '/Users/remyy/Applications/js/wrench/src/tools/budgetViewer/handlers/View.jsx'
]
*/

const debug = x => {
  console.log(x);
  return x;
};
const getSubDependencies = async file => {
  return readFile(file)
    .then(contents => parseWithAST(file, contents))
    .then(imports => {
      const promises = imports.map(getSubDependencies);
      return Promise.all(promises).then(subImports => {
        if (!subImports.length) { debugger; }
        debug(file);
        return subImports.length
          ? imports.concat(subImports)
          : imports;
      });
    }).
    then( allImports => {
      return uniq(allImports).map( x => console.log( x ));
    });
  }

getRootDependencies(config);
