const fs = require('fs');
const findIt = require('findit');
const path = require('path');
const allComponents = fs.readdirSync('src/_shared/components/');
const cliArg = process.argv.slice(2);
const isRelease = process.env.RELEASE || false;
let compList = [];

// ---------------------------------------
// Functions
// ---------------------------------------
function initialize(list) {
  const componentScaffold = [];
  for (const comp in list) {
    if (list[comp] === undefined ) {
      console.log(`Could not find component(s): ${cliArg[comp]}`);
    } else {
      if (list[comp] !== '__tests__' && list[comp] !== 'index.js') {
        fs.stat(`src/_shared/components/${list[comp]}/__tests__`, (err, stat) => {
          componentScaffold.push({
            name: list[comp],
            count: 0,
            paths: [],
            hasTests: err === null,
          });
        });
      }
    }
  }
  return componentScaffold;
}

function matchComponent(fileString, filePath) {
  compList = compList.map((comp) => {
    const isParent = fileString.indexOf(`/${comp.name}/`) !== -1;
    const isChild = fileString.indexOf(`/${comp.name}'`) !== -1;
    if (isParent || isChild ) {
      comp.count += 1;
      comp.paths.push(filePath);
    }
    return comp;
  });
}

function filterComponents(reqComps, allComps) {
  return reqComps.map((reqComp) => {
    const foundComponent = allComps.filter(comp => comp === reqComp)[0];
    if (foundComponent !== undefined) {
      return foundComponent;
    }
  });
}

// Promise Factory
const walkDirectory = directory => new Promise((resolve) => {
  const finder = findIt(directory);
  finder.on('file', (filePath) => {
    const contents = fs.readFileSync(filePath, 'utf8');
    const isJS = path.extname(filePath) === '.js';
    const isJSX = path.extname(filePath) === '.jsx';
    if ( isJS || isJSX ) {
      matchComponent(contents, filePath);
    }
  });

  finder.on('end', () => resolve(directory));
});

// ---------------------------------------
// Script Body
// ---------------------------------------
if (cliArg.length !== 0 && !isRelease) {
  compList = initialize(filterComponents(cliArg, allComponents));
} else {
  compList = initialize(allComponents);
}

const directories = [
  'src/tools',
  'src/_shared/components',
];

const dirWalkPromises = directories.map(walkDirectory);
Promise.all(dirWalkPromises).then(() => {
  const metaInfo = compList.reduce((acc, curr) => {
    const isMostUsed = curr.count >= acc.count;
    return {
      grandTotal: acc.grandTotal + curr.count,
      mostUsed: isMostUsed ? curr.name : acc.mostUsed,
      count: isMostUsed ? curr.count : acc.count,
    };
  }, { grandTotal: 0, mostUsed: '', count: 0 });

  const compListTotals = {
    componentList: compList,
    grandTotal: metaInfo.grandTotal,
    mostUsed: {
      name: metaInfo.mostUsed,
      count: metaInfo.count,
    },
  };
  const formattedData = JSON.stringify(compListTotals, null, 2);

  if (isRelease) {
    fs.writeFile(cliArg[0], formattedData, (err) => {
      if (err) throw err;
    });
  } else {
    return console.log(formattedData);
  }
});
