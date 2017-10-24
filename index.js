// const analyzeDir = require('./fileReadingUtils.js').analyzeDir;
// const fs = require('fs');
const fs = require('fs-extra');
const path = require('path');
const { uniq, flatten } = require('ramda');
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
  getAbsolutePathFromfile,
  getDir,
  isLocalImport,
  localResolver,
  readFile,
  tryExtensions,
  tryFile,
} = require('./lib.js');


// =======
// Config
// =======
const rootDir = '/Users/remyy/Applications/ruby/procore/wrench/';
const packageJson = '/Users/remyy/Applications/ruby/procore/wrench/package.json';
const packageConfig = require(packageJson);
const packageDependencies = packageConfig.dependencies;
const entryPoint = 'src/tools/budgetViewer/mounts/ProjectLevel/View.js';
// const entryPoint = 'src/_shared/decorators/sagaProvider/sagaProvider.jsx';


const PROCESSED_REMOVE_ME = {};


const config = {
  rootDir,
  entryPoint,
  packageDependencies,
  extensions: ['/index.jsx', '/index.js', '.jsx', '.js'],
  localResolver,
  destinationRoot: '/Users/remyy/Applications/js/wrench-migrator-test',
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

/*
 ___  _________        ___       __   ________  ________  ___  __    ________                        ___    ___ ________      ___    ___ ___
|\  \|\___   ___\     |\  \     |\  \|\   __  \|\   __  \|\  \|\  \ |\   ____\                      |\  \  /  /|\   __  \    |\  \  /  /|\  \
\ \  \|___ \  \_|     \ \  \    \ \  \ \  \|\  \ \  \|\  \ \  \/  /|\ \  \___|_                     \ \  \/  / | \  \|\  \   \ \  \/  / | \  \
 \ \  \   \ \  \       \ \  \  __\ \  \ \  \\\  \ \   _  _\ \   ___  \ \_____  \         ___         \ \    / / \ \   __  \   \ \    / / \ \  \
  \ \  \   \ \  \       \ \  \|\__\_\  \ \  \\\  \ \  \\  \\ \  \\ \  \|____|\  \       |\  \         \/  /  /   \ \  \ \  \   \/  /  /   \ \__\
   \ \__\   \ \__\       \ \____________\ \_______\ \__\\ _\\ \__\\ \__\____\_\  \      \ \  \      __/  / /      \ \__\ \__\__/  / /      \|__|
    \|__|    \|__|        \|____________|\|_______|\|__|\|__|\|__| \|__|\_________\     _\/  /|    |\___/ /        \|__|\|__|\___/ /           ___
                                                                       \|_________|    |\___/ /    \|___|/                  \|___|/           |\__\
                                                                                       \|___|/                                                \|__|
*/

getRootDependencies(config)
  // .then( allImports => allImports.sort().map(debug));
  .then( allImports => {
    allImports.map( absolutePath => {
      const relativePath = absolutePath.replace(config.rootDir, '');

      fs.copySync(
        absolutePath,
        path.join(config.destinationRoot,relativePath)
      );
    })
  });
