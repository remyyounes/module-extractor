# Hydra Migrator

A tool that assists the migration of a `Wrench` tool to a `Hydra` client.

## How it works
- `acorn.parse` to build an AST from a javascript file
- `acorn.walk` to gather all `ImportStatements` and `require` statements
- filter npm packages
- resolve magic imports with `alternatePaths` (ie: `_shared`)
- recurse down the tree and mark visited node

## Step-By-Step Guide
Update `./config.js` to configure your resolver and your tool preferences

### configure your file resolver
`alternatePaths` and `extensions` are used by the resolver to generate possible paths
`packages` is a list black-listed imports that your resolver skips over.
By default, it is set to your `package.json`'s dependencies entry.

### Run the migrator

```
node index.js
```

## notes
# How alternatePaths works


<!-- file: src/tools/photos/mounts/Photos.jsx
import: 'components/foo'

searchPaths = alternatePaths.concat(currentDirectory) -->


```
src/tools/photos/mounts/Photos.jsx
// 1 src/tools/photos/mounts/components/foo
//   src/tools/photos/mounts/components/foo/index.jsx
//   src/tools/photos/mounts/components/foo.js
// 2 src/_shared/components/foo
//   src/_shared/components/foo/index.js
//   src/_shared/components/foo.js **

```


budgetViewer attempt
==

import bundle in app/views/company_area/configurable_budgeting/budget_templates/index.html.erb
