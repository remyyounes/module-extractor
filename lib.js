const path = require('path');
const fs = require('fs');

const debug = x => {
  console.log(x);
  return x;
};

const tryFile = file => {
  try {
    return fs.existsSync(file) && file;
  }catch(e) {
    return undefined;
  }
}
const tryExtensions = extensions => path => {
  return extensions.reduce(
    (acc, ext) => acc ? acc : tryFile(path + ext),
    undefined
  );
};


const readFile = path => {
  return new Promise((resolve, reject) => {
    fs.lstat(path, (err, stats) => {
      if(err) {
        reject(err);
        return;
      }
      if (stats.isDirectory()) { return; }
      if (stats.isFile()) {
        fs.readFile(path, 'utf-8', function(err, content) {
          if(err) {
            reject(err);
            return;
          }
          resolve(content);
        });
      }
    });
  });
};


const getAbsolutePathFromfile = file => relativePath => {
  return path.resolve(path.dirname(file) + '/' + relativePath);
}

const isLocalImport = filepath => {
  return filepath.includes('/');
};

const localResolver = (config, currentPath, src) => {
  const tryPath = tryExtensions(config.extensions);
  const currentDir = path.dirname(currentPath);
  const localSources = !!config.packageDependencies[src]
    ? []
    : [
      currentDir,
      `${config.rootDir}/src/_shared`,
    ]

  const resolved = localSources.reduce((acc, localSource) => {
    return !!acc
    ? acc
    : tryPath(
      path.resolve( path.join(localSource, src) )
    );
  }, false);
  return resolved;
}


module.exports = {
  debug,
  getAbsolutePathFromfile,
  getDir: path.dirname,
  isLocalImport,
  readFile,
  localResolver,
  tryExtensions,
  tryFile,
};
