import React from 'react'
import Helmet from 'react-helmet'
import { renderToString } from 'react-dom/server'
import { renderStatic } from 'glamor/server'

export default class Layout extends React.Component{
  render(){
    let { assets = [], children, routes = [], hydrate = {} } = this.props
    let content = renderToString(children)
    let { css, ids } = renderStatic(() => content)
    let { head } = Helmet.rewind()
    return <html lang="en-us">
      <head>        
        <meta name="theme-color" content="#db5945" />
        {/* <link rel="manifest" href="/manifest.webmanifest" /> --> */}
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {assets
          .filter(path => path.endsWith('.css'))
          .map(path => <link rel="stylesheet" key={path} href={path} />)}
        <style id='rakt-css'>${css || ''}</style>
      </head>
      <body>
        <div id="root" dangerouslySetInnerHTML={{ __html: content }} />
        <noscript id='rakt-cssids' data-cssids={JSON.stringify(ids)}/>
        <noscript id='rakt-ssr' data-ssr={JSON.stringify(hydrate)}/>
        {assets
          .filter(path => path.endsWith('.js'))
          .map(path => <script key={path} src={path} />)}
        <script dangerouslySetInnerHTML={{ __html: `window.__init()` }} />
      </body>
    </html>
  }
}