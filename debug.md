notes
====
acorn.parse  doesn't like:
  - static
  - decoratoring with @ on class that is "export default";

we dont have to parse the body, we can skip errors;


How to connect the app to the chrome dev console t
node-inspect --inspect-brk=[port] index.js

chrome://inspect/#devices

```
// TODO: packagejson
// TODO: also copy the following
// - dot files
// - packageJson
// - change ../public reference
// import components/styles
// import asset/styles
// - change webpack
// bundle: [
//       `webpack-dev-server/client?http://${HOST}:${PORT}`,
//       'webpack/hot/dev-server',
//       './tools/budgetViewer/mounts/ProjectLevel/View.js',
//     ],
```
