import React from 'react'
import express from 'express'
import path from 'path'
import parseModules from './parseModules'
import parseRoutes from './parseModules'
import webpack from 'webpack'
import { Route } from 'react-router-dom'

import favicon from 'serve-favicon'

import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import Layout from './layout'
import { Rakt } from './'
import devware from 'webpack-dev-middleware'
import hotware from 'webpack-hot-middleware'
import historyApiFallback from 'connect-history-api-fallback'

import Helmet from 'react-helmet'

// let oldRender = Route.render 

// // when you're not applying webpack on server files 
// Route.render = (props) => {
//   let { module, match, absolute } = props
//   console.log({absolute})
//   if(module && match){
    
//     let Module = require(absolute)
//     console.log('sadasdasd')
//     return oldRender({...props, match, Module})
//   }
//   return oldRender(props)
// }



export default function server({ entry }){
  
  let modules = parseModules(entry)
  let routes = parseRoutes(entry)

  let compiler = webpack({ 
    devtool: "source-map",
    entry,
    output: {
      path: __dirname, // todo - ?
      filename: "[name].bundle.js",
      chunkFilename: "[name].chunk.js"
    },  
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "babel-loader",
          query: {
            "presets": [ "es2015", "stage-0", "react" ],
            "plugins": [ require.resolve("./babel.js"), require.resolve("./babel2.js"), "transform-decorators-legacy" ]
          }   // todo - ?
        }
      ]    
    }
  })
  // webpack dev server 

  const app = express()

  // app.use(historyApiFallback({ verbose: false }));
  // app.use(devware(compiler, {
  //   noInfo: true
  //   // ,publicPath: config.output.publicPath
  // }))

  // app.use(hotware(compiler));

  app.use(favicon('./favicon.png'));

  app.use('/api/:mod/*', (req, res, next ) => {
    
    let mod = require(modules[req.params.mod].replace('./example', '.'))
    mod = (mod.default ? mod.default : mod)
    if(mod.mod){
      // todo - deep?
      mod.mod({req}, (err, data) => {
        return err ? next(err) : res.send(data)
      })
    }
    else {
      next(404)
    }          
  })

  app.get('*', (req, res, next) => {
    // fetch data 
    let App = require(entry)
    App = App.default || App

    let context = {}
    let html = renderToString(
      <Layout>
        <StaticRouter location={req.url} context={context} basename='app'>
          <Rakt>
            <div>
              <Helmet title="Home" />
              <App />  
            </div>
          </Rakt>        
        </StaticRouter>
      </Layout>)
    res.type('html')
    res.send('<!doctype html>' + html)    
  })
  return app
  // when do we 404?
}


