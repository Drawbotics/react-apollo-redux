import React from 'react';
import { graphql as apolloGraphql, compose } from 'react-apollo';
import { connect } from 'react-redux';
import upperCase from 'lodash/upperCase';
import snakeCase from 'lodash/snakeCase';
import toUpper from 'lodash/toUpper';
import hoistNonReactStatics from 'hoist-non-react-statics';


export { compose } from 'react-apollo';


const prefix = '@@MUTATION/'

export function constant(name, type = '') {
  return (
    prefix +
    toUpper(snakeCase(name + (type && '_' + type)) |> snakeCase |> toUpper)
  );
}

function reduxGraphql(options) {
  return (Component) => class ReduxGraphql extends React.Component {
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
          type: prefix + (options.name |> snakeCase |> toUpper),
          payload: args[0],
        });
        try {
          const result = await mutation(...args);
          dispatch({
            type: prefix + (options.name + '_success' |> snakeCase |> toUpper),
            payload: {
              result,
              args: args[0],
            }
          });
          return result;
        }
        catch (error) {
          dispatch({
            type: prefix + (options.name + '_fail' |> snakeCase |> toUpper),
            payload: args[0],
            meta: { error },
          });
          throw error;
        }
      };
    }
  }
}


export function graphql(query, options, ...rest) {
  // The first definition is the main operation
  const { operation } = query.definitions[0];
  if (operation !== 'mutation') {
    return (Component) => apolloGraphql(query, options, ...rest)(Component);
  }
  else if ( ! options || ! options.name && operation === 'mutation') {
    console.warn('Mutation detected without a explicit name. No redux actions will be dispatched.');
    return (Component) => apolloGraphql(query, options, ...rest)(Component);
  }
  else {
    return (Component) => {
      const Result = compose(
        connect(),
        apolloGraphql(query, options, ...rest),
        reduxGraphql(options),
      )(Component);
      return hoistNonReactStatics(Result, Component);
    };
  }
}
