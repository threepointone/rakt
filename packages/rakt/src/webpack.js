// copied from ratpack 


import webpack from 'webpack'
import path from 'path'

export function webpackify(filepath, options = {}) {
  
  let webpackCompiler = webpack({
    devtool: options.production ? false : (options.devtool || 'cheap-module-source-map'),
    entry: [ 
      ((options.reload !== false) || (options.production !== true) ) ? 
        require.resolve('react-dev-utils/webpackHotDevClient.js') : 
        undefined, 
      options.stats ? require.resolve('./stats.js') : undefined,
      require.resolve('./polyfills'), 
      options.offline ? require.resolve('./offline-plugin-runtime.js') : undefined,
      filepath 
    ].filter(x => !!x),
    output: {
      path: path.join(__dirname, '../public'),
      pathinfo: true,
      filename: 'bundle.js'
    },
    performance: {
      hints: false
    },
    module: {
      rules: [ 
        ...(options.rules || []).map(({ loader, files, options }) => ({ loader: require.resolve(loader), options, test: glob2regexp(files || '*') })), 
        {
          enforce: 'pre',
          test: /\.(js|jsx)$/,
          loader: require.resolve('eslint-loader'),
          exclude: /node_modules/,
          options: {
            configFile: path.join(__dirname, '../resources/.eslintrc')
          }
        }, 
        {
          exclude: [
            /\.html$/,
            /\.(js|jsx)$/,
            /\.css$/,
            /\.json$/,
            /\.svg$/
          ],
          loader: require.resolve('url-loader'),
          query: {
            limit: 10000,
            name: 'static/media/[name].[hash:8].[ext]'
          }
        }, 
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: require.resolve('babel-loader'),
          options: {
            'presets': [ 
              [ require('babel-preset-env'), { 
                'targets': {
                  'browsers': [ 'last 2 versions', 'safari >= 7' ]
                }, 
                modules: false 
              } ], 
              require('babel-preset-stage-0'), 
              require('babel-preset-react'),              
              ...(options.babel || {}).presets || []
            ],
            'plugins': [
              [ require.resolve('babel-plugin-transform-runtime'), {
                helpers: false,
                polyfill: false,
                regenerator: true
                // Resolve the Babel runtime relative to the config.
                // moduleName: path.dirname(require.resolve('babel-runtime/package'))
              } ],
              options.jsx ? [ require('babel-plugin-transform-react-jsx'),
                { 'pragma': options.jsx } ] : undefined,
              require('babel-plugin-transform-decorators-legacy').default,
              require('babel-plugin-transform-react-require').default,
              
              ...(options.babel || {}).plugins || []
            ].filter(x => !!x),
            cacheDirectory: false
          }
        }, 
        {
          test: /\.css$/,
          use: [
            require.resolve('style-loader'), 
            {
              loader: require.resolve('css-loader'),
              options: { importLoaders: 1 } 
            }, 
            require.resolve('postcss-loader')  // options in the plugins section below             
          ]
        }, 
        // {
        //   test: /\.json$/,
        //   loader: require.resolve('json-loader')
        // },
         {
          test: /\.svg$/,
          loader: require.resolve('file-loader'),
          query: {
            name: 'static/media/[name].[hash:8].[ext]'
          }
        } 
      ]
    },
    resolve: {
      alias: options.alias || {},
      extensions: [ '.js', '.json', '.jsx' ],
      // todo - windows
      modules: [ 'node_modules', path.join(app.getPath('home'), '.ratpack/node_modules'),  path.join(__dirname, '../node_modules') ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify((options.production && 'production') || process.env.NODE_ENV || 'development'),
        ...Object.keys(options.define || {}).reduce((o, key) => ({ ...o, [key]: JSON.stringify(options.define[key]) }), {})
      }),
      options.offline ? new OfflinePlugin(options.offline === true ? {} : options.offline) : undefined,
      new webpack.ProvidePlugin(options.provide || {}),
      new webpack.LoaderOptionsPlugin({
        test: /\.css$/,
        debug: true,
        options: {
          postcss: [
            autoprefixer({
              browsers: [
                '>1%',
                'last 4 versions',
                'Firefox ESR',
                'not ie < 9' // React doesn't support IE8 anyway
              ]
            })
          ]
        }
      })
    ].filter(x => !!x),
    stats: 'errors-only',
    node: {
      fs: 'empty',
      net: 'empty',
      tls: 'empty'
    }
  })
  
  let webpackServer = new WebpackDevServer(webpackCompiler, {
    // todo - windows
    contentBase: [ options.public ? path.join(path.dirname(filepath), options.public) : '', path.join(path.dirname(filepath), 'public'), path.join(__dirname, '../public') ].filter(x => !!x),
    historyApiFallback: true,
    compress: true,
    proxy: options.proxy || {},
        // setup()
        // staticOptions 

    quiet: true,      
    stats: { colors: false }  
  })
    // this is to workaround some weird bug where webpack keeps the first loaded file 
    // also makes it look cool ha
  let h = hash(filepath, filepath.length)+ ''
  let port = options.port || (3000 + parseInt(h.substr(h.length - 4), 10))
  webpackServer.listen(port)
  openBrowser('http://localhost:' + port)
  return { webpackServer, webpackCompiler, port }

}