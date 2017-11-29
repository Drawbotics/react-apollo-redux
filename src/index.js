import React from 'react';
import { graphql as apolloGraphql, compose } from 'react-apollo';
import { connect } from 'react-redux';
import upperCase from 'lodash/upperCase';
import snakeCase from 'lodash/snakeCase';
import toUpper from 'lodash/toUpper';


export { compose } from 'react-apollo';


export function graphql(query, options, ...rest) {
  // We can safely assume there's only gonna be one definition since apollo
  // triggers an error if there's more than that.
  const { operation } = query.definitions[0];
  if (operation !== 'mutation') {
    return (Component) => apolloGraphql(query, options, ...rest)(Component);
  }
  else if ( ! options && ! options.name && operation === 'mutation') {
    console.warn('Mutation detected without a explicit name. No redux actions will be dispatched.');
    return (Component) => apolloGraphql(query, options, ...rest)(Component);
  }
  else {
    return (Component) => {
      class GraphqlMutation extends React.Component {
        render() {
          const mutation = this._wrapMutation(this.props[options.name]);
          return React.createElement(Component, {
            ...this.props,
            [options.name]: mutation,
          });
        }

        _wrapMutation(mutation) {
          const { dispatch } = this.props;
          return async (...args) => {
            dispatch({
              type: options.name |> snakeCase |> toUpper,
              payload: args[0],
            });
            try {
              const result = await mutation(...args);
              dispatch({
                type: options.name + '_success' |> snakeCase |> toUpper,
                payload: result,
              });
              return result;
            }
            catch (error) {
              dispatch({
                type: options.name + '_fail' |> snakeCase |> toUpper,
                meta: { error },
              });
              throw error;
            }
          };
        }
      }
      return compose(
        connect(),
        apolloGraphql(query, options, ...rest),
      )(GraphqlMutation);
    };
  }
}
