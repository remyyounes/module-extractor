// const analyzeDir = require('./fileReadingUtils.js').analyzeDir;
// const fs = require('fs');
const fs = require('fs-extra');
const path = require('path');
const { uniq, flatten, concat } = require('ramda');
// const acorn = require('acorn');
const acorn = require("acorn/dist/acorn_loose");
// const injectAcornJsx = require('acorn-jsx/inject');
// const injectAcornObjectRestSpread = require('acorn-object-rest-spread/inject');
// const es7plugin = require('acorn-es7');
// injectAcornJsx(acorn);
// injectAcornObjectRestSpread(acorn);
// es7plugin(acorn) ;

const walk = require('acorn/dist/walk');
const {
  debug,
  exportToDestination,
  getAbsolutePathFromfile,
  getDir,
  isLocalImport,
  localResolver,
  readFile,
  tryExtensions,
  tryFile,
} = require('./lib.js');


// TODO: also copy the following
// - *.css *.scss
// - dot files
// - packageJson
// - change ../public reference

// =======
// Config
// =======
const rootDir = '/Users/remyy/Applications/ruby/procore/wrench/';
const packageJson = '/Users/remyy/Applications/ruby/procore/wrench/package.json';
const packageConfig = require(packageJson);
const packageDependencies = packageConfig.dependencies;
const entryPoint = 'src/tools/budgetViewer/mounts/ProjectLevel/View.js';
const extensions = ['/index.jsx', '/index.js', '.jsx', '.js', '.scss', '.css'];
// const entryPoint = 'src/_shared/decorators/sagaProvider/sagaProvider.jsx';


const PROCESSED_REMOVE_ME = {};


const config = {
  rootDir,
  entryPoint,
  packageDependencies,
  extensions,
  localResolver,
  destinationRoot: '/Users/remyy/Applications/ruby/procore/hydra_clients/budget/',
}

const addToImports = (config, imports, file, importStatement) => {
  const resolved = config.localResolver(config, file, importStatement);
  if ( resolved ) {
    imports.push(resolved);
  }
  return imports;
}

const extractImports = file => code => new Promise(resolve => {
  debugger;
  let imports = [];
  try {
    const ast = acorn.parse_dammit(code,
      {
        sourceType: 'module',
        // plugins: {
        //   objectRestSpread: true,
        //   es7: true,
        // },
        // ecmaVersion:7,
      }
    );

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
  } catch (e) {
    // console.log("TODO:", 'deal with errors', e)
  }
  resolve(imports);
});

const getEntry = config => `${config.rootDir}${config.entryPoint}`;

const getRootDependencies = config => getDependencies(getEntry(config));

const resolveImports = imports =>
  Promise.all( imports.map(getDependencies) )
  .then(flatten)
  .then(flattened => flattened.concat(imports) );


const getDependencies = async file => {
  if (PROCESSED_REMOVE_ME[file]) {
    return [];
  } else {
    PROCESSED_REMOVE_ME[file] = true;
    return readFile(file)
      .then(extractImports(file))
      .then(resolveImports)
      .then(uniq);
    }
  }

getRootDependencies(config)
  .then(exportToDestination(config.rootDir, config.destinationRoot));
