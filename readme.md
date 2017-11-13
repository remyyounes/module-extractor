# Hydra Migrator
A tool that assists the migration of a `Wrench` tool to a `Hydra` client.

## How it works
- `acorn.parse` to build an AST from a javascript file
- `acorn.walk` to gather all `ImportStatements` and `require` statements
- resolve magic imports with `alternatePaths` (ie: `_shared`)
- recurse down the tree and mark visited node
- copy all used files to a destination directory

### Run the migrator
```
node index.js
```

## Step-By-Step Guide
For a Step-by-step guide of converting your tool, please follow the [hydra
migration guide.](https://github.com/remyyounes/module-extractor/blob/master/hydra-migration-steps.md)

### Configure the file resolver
`alternatePaths` and `extensions` are used by the resolver to generate possible paths
`packages` is a list black-listed imports that your resolver skips over.
By default, it is set to your `package.json`'s dependencies entry.

### Cleanup your files
- No more require.ensure
- process.env can't be destructured

 ```
// Breaks - 2 args
const {
  NODE_ENV = 'development',
  BASE_URL = 'www',
} = process.env;

// Works - 1 args
const {
  NODE_ENV = 'development',
} = process.env;

// Best - 1 args
const NODE_ENV = process.env.NODE_ENV;
const BASE_ENV = process.env.BASE_ENV;
```
## notes

========
test problem resolution
========

- Removed all mocha imports
- had to change this import to make the test pass
```
// src/tools/budgetViewer/apis/columnDefinitions/sourceDefinitions.js
// src/tools/budgetViewer/components/shared/__tests__/sourceColumnDisplayFormatter.js
import sF from '../sourceColumnDisplayFormatter';
const {
  getSelectedSourceCategory,
  getSourcesInSelectedCategory,
  getFiltersInSourceByCategory,
  isDefinedSource,
  isFilterCheckedFor,
  sourceColumnFormatted,
  getSourceCategoryLabel,
} = sF;```

// need mocha preset
 yarn add --dev neutrino-preset-mocha
