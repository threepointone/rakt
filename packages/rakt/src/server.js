import React from 'react'
import express from 'express'
import path from 'path'
import parseModules from './parseModules'
import parseRoutes from './parseRoutes'
import webpack from 'webpack'
import { Route } from 'react-router-dom'
import 'isomorphic-fetch'

import favicon from 'serve-favicon'

import { renderToString } from 'react-dom/server'
import { StaticRouter, matchPath } from 'react-router'
import Layout from './layout'
import { Rakt } from './'
import devware from 'webpack-dev-middleware'
import hotware from 'webpack-hot-middleware'
import historyApiFallback from 'connect-history-api-fallback'

import Helmet from 'react-helmet'

// let oldRender = Route.render 

// // when you're not applying babel plugin on server files 
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

  let App = require(entry)
  App = App.default || App

  
  let modules = parseModules(entry)
  let routes = parseRoutes(entry)
  let compiler = webpack({ 
    devtool: "source-map",
    entry: [entry, require.resolve('./client.js')],
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
          }  
        },
        {
          test: /\.js$/,
          loader: require.resolve('./loader.js'),
          query: {
            entry
          } 
        }
      ]    
    }
  })
  // webpack dev server 

  const app = express()

  // app.use(historyApiFallback({ verbose: false }));
  app.use(devware(compiler, {
    // noInfo: true,
    publicPath: '/app'
  }))

  app.use(hotware(compiler));

  app.use(favicon('./favicon.png'));

  app.use('/api/:mod/*', (req, res, next ) => {
    let mod = require(modules[req.params.mod])
    mod = (mod.default ? mod.default : mod)
    if(mod.mod){
      // todo - deep?
      mod.mod({
        req, res, next, 
        done: (err, data) => err ? next(err) : res.send(data)
      })
    }
    else {
      next(404)
    }          
  })

  app.get('*', (req, res, next) => {
    // how to ignore
    // fetch data 

    let matches = routes.filter(({ path, exact, strict }) => 
      matchPath(req.url, '/app' + path, { exact, strict }))  

    let fetchers = matches    
      .filter(x => {
        let m = require(x.module)
        m = m.default || m 
        return !!m.mod 
      })

    function andThen(err, data){
      
      let cache = {}
      data.forEach(x => {
        cache[`${x.hash}:${req.url}`] = x.result
      })

      let context = {}
      let html = renderToString(
        <Layout assets={[ 'main.bundle.js', ...matches.map(x => `${x.hash}.chunk.js`)]} 
          routes={routes.map(({module, ...rest}) => rest)} 
          hydrate={cache}>
          <StaticRouter location={req.url} context={context} basename='app'>
            <Rakt cache={cache}>
              <div>
                <Helmet title="Home" />
                <App />  
              </div>
            </Rakt>        
          </StaticRouter>
        </Layout>)
      res.type('html')
      res.send('<!doctype html>' + html)    
    }

    let promises = fetchers    
      .map(x => {
        return fetch(`http://localhost:3000/api/${x.hash}${req.url}`)
          .then(x => x.json())
      })

    Promise.all(promises).then(results => 
      andThen(undefined, matches.map((x, i) => 
        ({...x, result: results[i]}))), 
      andThen)    
    
  })
  return app
  // when do we 404?
}


