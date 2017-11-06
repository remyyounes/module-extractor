# Migration Steps
0. rails generate hydra:client <CLIENT_NAME>
0. add module-extractor config file
0. run module-extractor
0. Fix Mounting / Connecting
  - JS mount points no longer use promises from the JS side (see section)
  - ERB mounting should use the Hydra helper on rails side (see section)
0. Fix the "process" bug

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

Important notes!
- client_javascript_include_tag must come after the content tag!
