import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';


const config = {
  input: 'src/index.js',
  name: 'ReactApolloRedux',
  globals: {
    'react': 'React',
    'react-redux': 'ReactRedux',
    'react-apollo': 'react-apollo',
  },
  plugins: [
    nodeResolve(),
    babel({
      exclude: '**/node_modules/**',
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    commonjs(),
  ],
  output: [
    { file: 'lib/index.umd.js', format: 'umd' },
  ],
};


if (process.env.NODE_ENV === 'production') {
  config.plugins.push(uglify({
    compress: {
      warnings: false,
      pure_getters: true,
      unsafe: true,
      unsafe_comps: true,
    },
  }));
}


export default config;
