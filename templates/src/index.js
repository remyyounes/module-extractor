import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import App from './App';

const load = () => {

  const node = document.getElementById('root');
  const props = JSON.parse(node.dataset.reactProps);
  const reactComponent = node.dataset.reactComponent;

  return render((
    <AppContainer>
      <App reactComponent={reactComponent} data={props}/>
    </AppContainer>
  ), document.getElementById('root'))
};

if (module.hot) {
  module.hot.accept('./App', load);
}

load();
