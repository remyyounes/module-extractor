# Migration Steps
1. `$ rails generate hydra:client <CLIENT_NAME>`
1. clone module-extractor
1. modify config object in module-extractor/config.js
1. pre extractor run, check your provider type (sage, wrap, loop)
1. run module-extractor (`$ node index`)

# Manual hydra client fixes
1. `$ cd hydra_clients/<CLIENT_NAME>`
1. `$ npm install -g depcheck && depcheck`
1. `$ yarn add --dev babel-plugin-transform-runtime`
1. `$ yarn install`
1. Fix Mounting / Connecting
    1. JS mount points no longer use promises from the JS side (see section)
    1. ERB mounting should use the Hydra helper on rails side (see section)
1. Fix the Tests
    1. remove mocha imports
    1. fix any destructuring issues

## Mocha Imports
 comment out / remove all of the mocha imports using this regex: `/import (.*) from 'mocha'/`

 We no longer need to import these files as the test configuration will do this for us.

# Fixing the Mounting / Connecting
Having to rewire the components through hydra is the only manual labor left, but
luckily it isn't hard at all :)

## Removing Promises from Client
The only real manual labor in this is converting the mount points to not use
promises

Given this code:
```js
const BudgetEdit = () => {
  return new Promise((resolve) => {
      require.ensure([], () => {
          const linkBudgetEdit = require('../../handlers/Edit');

          const Bootstrapped = sagaProvider(
              {
                budget: budgetReducer,
                summaryReducer,
              },
            sagas,
            linkBudgetEdit,
          );

          resolve(Bootstrapped);
      });
  });
};

export default BudgetEdit;
```

You would change it to look like this:
```js
const linkBudgetEdit = require('../../handlers/Edit');

const BudgetEdit = sagaProvider(
    {
      budget: budgetReducer,
      summaryReducer,
    },
  sagas,
  linkBudgetEdit,
);

export default BudgetEdit;
```

## Using Hydra to mount your component

Here is how you are probably mounting a react component
```erb
 <%= react_component("BudgetView", @budget_view_configuration.component_props) %>
```

Here is the new syntax
```erb
<%= content_tag(
      :div,
      nil,
      'id': 'root',
      data: {
        'react-component': 'View',
        'react-props': @budget_view_configuration.component_props.to_json,
      }
    )
%>

<%= client_javascript_include_tag("budgetViewer") %>
```

# Common Issues & Gotchas
- client_javascript_include_tag must come after the content tag!
- Don't have the same component served up by both `react_component` and
  `client_javascript_include_tag` this will result in unwanted behaviour
- using moment with a react-widget DateTimePicker seems to not
  work. See [this github
  issue](https://github.com/jquense/react-widgets/issues/223#issuecomment-147394659) for more details.
  You can fix this issue by adding these lines to the component you are having
  issues with:
  ```js
  import DateTimePicker from 'react-widgets/lib/DateTimePicker';
  import momentLocalizer from 'react-widgets/lib/localizers/moment';

  momentLocalizer(moment);
  ```
  If you need to do this, pull it up to the root of your application
