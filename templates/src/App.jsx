import View from "./tools/budgetViewer/mounts/projectLevel/View.js"
import CreateSnapshot from "./tools/budgetViewer/mounts/projectLevel/CreateSnapshot.js"
import DeleteSnapshot from "./tools/budgetViewer/mounts/projectLevel/DeleteSnapshot.js"
import Create from "./tools/budgetViewer/mounts/companyLevel/Create.js"
import Edit from "./tools/budgetViewer/mounts/companyLevel/Edit.js"
const components = {
  View,
  CreateSnapshot,
  DeleteSnapshot,
  Create,
  Edit
}

import React from 'react';

const App = ({reactComponent, data}) => {
  const Component = components[reactComponent];
  return <Component {...{...data}} />
}


export default App;
