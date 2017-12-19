# React Apollo Redux

This library wraps the `graphql` function from [react-apollo](https://github.com/apollographql/react-apollo) function by also dispatching redux actions when a mutation is called.

If you were using
```
import { graphql } from 'react-apollo';
```
you may now do
```
import { graphql } from 'react-apollo-redux';
```

### Usage

When a mutation is called, an action bearing the same name (snake and upper cased) and prefixed with `@@MUTATION` is dispatched. For example, a mutation like this
```
const FollowItems = gql`
  mutation followItems($itemIds: [ID]!) {
    followItems(item_ids: $itemIds) {
      id,
    },
  }
`;


graphql(FollowItems, {
  name: 'followItems',
}),
```
Will dispatch the following actions with respective types:

#### type @@MUTATION/FOLLOW_ITEMS
`@@MUTATION/[name]` contains the arguments to the mutation in its payload. For example, if the mutation was called this way
```
followItems({
  variables: {
    itemIds: itemIds,
  },
  extra: {
    user,
    references,
  },
});
```
The payload will contain that object.

#### type @@MUTATION/FOLLOW_ITEMS_SUCCESS
`@@MUTATION/[name]_SUCCESS` is dispatched once the mutation result is successfully returned from the server. The action payload contains two things:
- The `result` from the server (as specified in the mutation)
- The arguments (`args`) passed to the mutation, like above


#### type @@MUTATION/FOLLOW_ITEMS_FAIL
`@@MUTATION/[name]_FAIL` is dispatched if the server returns an error. This action contains the same payload as the initial action `@@MUTATION/FOLLOW_ITEMS`, and has an additional `meta` property with the error returned from the server.
