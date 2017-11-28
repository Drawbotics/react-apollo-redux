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
  if ( ! options.name && operation === 'mutation') {
    console.warn('Mutation detected without a explicit name. No redux actions will be dispatched.');
    return apolloGraphql(query, options, ...rest);
  }
  else if (operation !== 'mutation') {
    return apolloGraphql(query, options, ...rest);
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
            dispatch({ type: options.name |> snakeCase |> toUpper });
            try {
              const result = await mutation(...args);
              dispatch({ type: options.name + '_success' |> snakeCase |> toUpper });
              return result;
            }
            catch (err) {
              dispatch({ type: options.name + '_fail' |> snakeCase |> toUpper });
              throw err;
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
