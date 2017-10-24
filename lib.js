const path = require('path');
const fs = require('fs');

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

const localResolver = config => importStatement => {
  config
}


module.exports = {
  getAbsolutePathFromfile,
  getDir: path.dirname,
  isLocalImport,
  readFile,
  localResolver,
  tryExtensions,
  tryFile,
};
