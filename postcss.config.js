module.exports = ({file, options, env}) => {
  var debug = true;
  return {
    parser: 'postcss-scss',
    plugins: {
      'postcss-import': {root: file.dirname},
      'postcss-preset-env': options.cssnext && !debug ? options.cssnext : false
      //env == 'production' ? options.autoprefixer : false,
      //     'cssnano': env === 'production' ? options.cssnano : false
    }
  }
}
