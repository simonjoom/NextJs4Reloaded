import path, { sep } from 'path'
import webpack from 'webpack'
import resolve from 'resolve'
import CaseSensitivePathPlugin from 'case-sensitive-paths-webpack-plugin'
//import WriteFilePlugin from 'write-file-webpack-plugin'
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin'
import { loadPartialConfig, createConfigItem } from '@babel/core'
import { getPages } from './webpack/utils'
//import PagesPlugin from './plugins/pages-plugin'
import NextJsSsrImportPlugin from './plugins/nextjs-ssr-import'
import DynamicChunksPlugin from './plugins/dynamic-chunks-plugin'
import UnlinkFilePlugin from './plugins/unlink-file-plugin'
import PagesManifestPlugin from './plugins/pages-manifest-plugin'
import BuildManifestPlugin from './plugins/build-manifest-plugin'

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

//const presetItem = createConfigItem(require('./babel/preset'), {type: 'preset'})
const hotLoaderItem = createConfigItem(require('react-hot-loader/babel'), {type: 'plugin'})
const reactJsxSourceItem = createConfigItem(require('@babel/plugin-transform-react-jsx-source'), {type: 'plugin'})

const nextDir = path.join(__dirname, '..', '..')
const nextNodeModulesDir = path.join(nextDir, 'node_modules')
const nextPagesDir = path.join(nextDir, 'pages')
const defaultPages = [
  '_error.js',
  '_document.js',
  '_app.js'
]
const interpolateNames = new Map(defaultPages.map((p) => {
  return [path.join(nextPagesDir, p), `dist/bundles/pages/${p}`]
}))

function babelConfig(dir, {isServer, dev}) {
  const mainBabelOptions = {
    cacheDirectory: true,
    presets: [],
    plugins: [
      dev && !isServer && hotLoaderItem,
     // dev && reactJsxSourceItem
    ].filter(Boolean)
  }
  var req = require('./babel/preset')();
  var preset = loadPartialConfig(req);
  preset.options.cacheDirectory = false;
  /*
    const filename = path.join(dir, 'filename.js')
    const externalBabelConfig = loadPartialConfig({ babelrc: true, filename })
    if (externalBabelConfig && externalBabelConfig.babelrc) {
      // Log it out once
      if (!isServer) {
        console.log(`> Using external babel configuration`)
        console.log(`> Location: "${externalBabelConfig.babelrc}"`)
      }
      mainBabelOptions.babelrc = true
    } else {
      mainBabelOptions.babelrc = false
    }
  
    // Add our default preset if the no "babelrc" found.
    if (!mainBabelOptions.babelrc) {
      mainBabelOptions.presets.push(presetItem)
    }
  
    return mainBabelOptions
    */
  preset.options.sourceMap = true;
  preset.options.passPerPreset = false;
  preset.options.babelrc = false;
  //if (!preset.options.babelrc) {
//var cof=[false && dev &&!isServer && hotLoaderItem, dev && reactJsxSourceItem].filter(Boolean);
  
  preset.options.plugins = mainBabelOptions.plugins.concat(preset.options.plugins);
  // }
  
  return preset;
  
}

function generateChunkConfig(_ref2) {
  var dev = _ref2.dev,
    isServer = _ref2.isServer;
  
  if (isServer) {
    return {}
  }
  // if (dev) {
  return {
    chunks: "async",
    cacheGroups: {
      /*styles: {
        name: 'bundles/pages/_app.js.css',
        test: /\.(sc|c)ss$/,
        chunks: 'all',
        reuseExistingChunk: true
      },*/
      commons: {
        test: /(node_modules\/(?!next\/client)(?!webpack-hot).*\.js)/,
        name: 'static/vendors',
        chunks: 'all',
        enforce: false,
        reuseExistingChunk: true
      }
    }
  }
}

function externalsConfig(dir, isServer) {
  const externals = []
  
  if (!isServer) {
    return externals
  }
  
  externals.push((context, request, callback) => {
    resolve(request, {basedir: path.join(__dirname, '..', '..', '..'), preserveSymlinks: true}, (err, res) => {
      if (err) {
        return callback()
      }
      if (res.match(/next-routes[/\\]/)) {
        return callback()
      }
      // Default pages have to be transpiled
      if (res.match(/next[/\\]pages/)) {
        return callback()
      }
      
      // Webpack itself has to be compiled because it doesn't always use module relative paths
      if (res.match(/node_modules[/\\]webpack/)) {
        return callback()
      }
      
      if (res.match(/node_modules[/\\].*\.js$/)) {
        return callback(null, `commonjs ${request}`)
      }
      
      callback()
    })
  })
  
  return externals
}

export default async function getBaseWebpackConfig(dir, {dev = false, isServer = false, buildId, config}) {
  const babelLoaderOptions = babelConfig(dir, {dev, isServer})
  
  const defaultLoaders = {
    babel: {
      loader: 'babel-loader',
      options: babelLoaderOptions.options
    }
  }
  
  // Support for NODE_PATH
  const nodePathList = (process.env.NODE_PATH || '')
  .split(process.platform === 'win32' ? ';' : ':')
  .filter((p) => !!p)
  
  const pagesEntries = await getPages(dir, {dev, isServer, pageExtensions: config.pageExtensions.join('|')})
  console.log(pagesEntries)
  const totalPages = Object.keys(pagesEntries).length
  const clientEntries = !isServer ? {
    'static/main': [dev && !isServer && path.join(__dirname, '..', '..', 'client', 'fixwebpackpath'),
                       dev && !isServer && path.join(__dirname, '..', '..', 'client', 'webpack-hot-middleware-client'),
      //  dev && !isServer && path.join(__dirname, '..', '..', 'client', 'on-demand-entries-client'),
                       require.resolve(`../../client/next${dev ? '-dev' : ''}`)
    ].filter(Boolean),
    //"style.js":path.join(dir,"/static/css/nprogress.css")
  } : {}
  
  let webpackConfig = {
    mode: dev ? 'development' : 'production',
    devtool: dev ? 'cheap-module-eval-source-map' : false,
    name: isServer ? 'server' : 'client',
    cache: false,
    recordsPath: path.resolve(dir, './records.json'),
    target: isServer ? 'node' : 'web',
    externals: externalsConfig(dir, isServer),
    context: dir,
    // Kept as function to be backwards compatible
    entry: async () => {
      return {
        ...clientEntries,
        // Only _error and _document when in development. The rest is handled by on-demand-entries
        ...pagesEntries
      }
    },
   /* devServer: {
      hot: true,
      contentBase: path.join(dir, config.distDir, isServer ? 'dist' : ''),
    },*/
    output: {
      publicPath: '/_next/',
      path: path.join(dir, config.distDir, isServer ? 'dist' : ''), // server compilation goes to `.next/dist`
      filename: '[name].js',
      libraryTarget: 'commonjs2',
      // This saves chunks with the name given via require.ensure()
      chunkFilename: dev ? '[name].js' : '[name]-[chunkhash].js',
      // devtoolModuleFilenameTemplate: '[resource-path]'
      //strictModuleExceptionHandling: true
    },
    performance: {hints: false},
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
      modules: [
        nextNodeModulesDir,
        'node_modules',
        ...nodePathList // Support for NODE_PATH environment variable
      ],
      alias: {
        next: nextDir,
        // React already does something similar to this.
        // But if the user has react-devtools, it'll throw an error showing that
        // we haven't done dead code elimination (via uglifyjs).
        // We purposly do not uglify React code to save the build time.
        // (But it didn't increase the overall build size)
        // Here we are doing an exact match with '$'
        // So, you can still require nested modules like `react-dom/server`
        react$: dev ? 'react/cjs/react.development.js' : 'react/cjs/react.production.min.js',
        'react-dom$': dev ? 'react-dom/cjs/react-dom.development.js' : 'react-dom/cjs/react-dom.production.min.js'
      }
    },
    resolveLoader: {
      modules: [
        nextNodeModulesDir,
        'node_modules',
        path.join(__dirname, 'loaders'),
        ...nodePathList // Support for NODE_PATH environment variable
      ]
    },
    optimization: {
      splitChunks: generateChunkConfig({
        dev: dev,
        isServer: isServer
      }),
      minimize: !isServer && !dev
    },
    module: {
      rules: [
        dev && !isServer && {
          test: /\.(js|jsx)$/,
          loader: 'hot-self-accept-loader',
          include: [
            path.join(dir, 'pages'),
            nextPagesDir
          ],
          options: {
            extensions: /\.(js|jsx)$/
          }
        },
        {
          test: /\.(js|jsx)$/,
          include: [dir, nextDir],
          exclude: /node_modules/,
          use: defaultLoaders.babel
        }
      ].filter(Boolean)
    },
    plugins: [
      new webpack.IgnorePlugin(/(precomputed)/, /node_modules.+(elliptic)/),
      dev && !isServer && new FriendlyErrorsWebpackPlugin(),
      dev && !isServer && new webpack.HotModuleReplacementPlugin(), // Hot module replacement
      dev && new UnlinkFilePlugin(),
      // dev && new CaseSensitivePathPlugin(), // Since on macOS the filesystem is case-insensitive this will make sure your path are case-sensitive
    /*  dev && new webpack.LoaderOptionsPlugin({
        options: {
          context: dir,
          customInterpolateName(url, name, opts) {
            return interpolateNames.get(this.resourcePath) || url
          }
        }
      }),*/
      /* dev && new WriteFilePlugin({
          exitOnErrors: false,
          log: false,
          // required not to cache removed files
          useHashIndex: false
        }),*/
      !dev && new webpack.IgnorePlugin(/react-hot-loader/),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(dev ? 'development' : 'production')
      }),
      isServer && new PagesManifestPlugin(),
      !isServer && new BuildManifestPlugin(),
      //?? !isServer && new PagesPlugin(),
      !isServer && new DynamicChunksPlugin(),
      isServer && new NextJsSsrImportPlugin(),
      // In dev mode, we don't move anything to the commons bundle.
      // In production we move common modules into the existing main.js bundle
      // We use a manifest file in development to speed up HMR
    ].filter(Boolean)
  }
  
  if (!isServer)
    webpackConfig.plugins.push(new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      
      filename: dev ? '[name].css' : '[name].[hash].css',
      chunkFilename: dev ? '[name].css' : '[name]-[chunkhash].css'
    }))
  /*webpackConfig.plugins.push(new webpack.SourceMapDevToolPlugin({
              filename: "[file].map"
}))*/
  
  
  webpackConfig.module.rules.push(
    {
      test: /(?!nprogress)\.(sc|c)ss$/,
      exclude: [
        /nprogress/,
      ],
      use: [
        {
          loader: dev ? (isServer ? "do-nothing-loader" : 'style-loader') : MiniCssExtractPlugin.loader
        },
        {
          loader: isServer ? 'css-loader/locals' : "css-loader",
          options: {
            modules: true,
            minimize: !dev,
            sourceMap: dev,
            importLoaders: 2,
            //url: true
          }
        },
        {
          loader: "postcss-loader",
          options: {
            sourceMap: dev,
            config: {
              ctx: {
                cssnext: {
                  browsers: [
                    '>1%',
                    'last 4 versions',
                    'Firefox ESR',
                    'not ie < 9'
                  ],
                  flexbox: 'no-2009',
                  compress: false
                }
              },
              path: path.resolve(process.cwd(), './postcss.config.js')
            }
          }
        },
        {
          loader: "sass-loader",
          options: {
            sourceMap: dev
          }
        }
      ]
    }
  );
  
  webpackConfig.module.rules.push(
    {
      test: /nprogress\.css$/,
      use: [
        {
          loader:dev ? "css-hot-loader?fileMap=../bundles/pages/_app" : "do-nothing-loader"
        },
        {
          loader: (isServer ? "do-nothing-loader" : MiniCssExtractPlugin.loader)
        },
        {
          loader: isServer ? 'css-loader/locals' : 'css-loader',
          options: {
            modules: false,
            minimize: !dev,
            sourceMap: dev,
            importLoaders: 2,
            url: true
          }
        },
        {
          loader: "postcss-loader",
          options: {
            sourceMap: dev,
            config: {
              ctx: {
                cssnext: {
                  browsers: [
                    '>1%',
                    'last 4 versions',
                    'Firefox ESR',
                    'not ie < 9'
                  ],
                  flexbox: 'no-2009',
                  compress: false
                }
              },
              path: path.resolve(process.cwd(), './postcss.config.js')
            }
          }
        }
      ]
    }
  );
  
  if (typeof config.webpack === 'function') {
    webpackConfig = config.webpack(webpackConfig, {dir, dev, isServer, buildId, config, defaultLoaders, totalPages})
  }
  
  return webpackConfig
}
