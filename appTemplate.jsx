import React from 'react';

const App = ({reactComponent, data}) => {
  const Component = components[reactComponent];
  return <Component {...{...data}} />
}


export default App;
