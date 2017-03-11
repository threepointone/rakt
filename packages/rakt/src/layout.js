import React from 'react'
import Helmet from 'react-helmet'
import { renderToString } from 'react-dom/server'
import { renderStatic } from 'glamor/server'

export default class Layout extends React.Component{
  render(){
    let { children, hydrate = {}, scripts = [], stylesheets = [], deferred = [] } = this.props
    let content = renderToString(children)
    let { css, ids } = renderStatic(() => content)
    let { head } = Helmet.rewind()
    
    return <html lang="en-us">
      <head>        
        <meta name="theme-color" content="#db5945" />
        {/* <link rel="manifest" href="/manifest.webmanifest" /> --> */}
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />        
        {scripts.map(path => <link rel='preload' key={path} href={path} as='script' />)}
        {stylesheets.map(path => <link rel="stylesheet" key={path} href={'/' + path} />)}
        {deferred.map(({ script, data }) => [
          script && <link rel='preload' key={script} href={script} as='script'/>, 
          data && <link rel='prefetch' key={data} href={data} />])}
        <style id='rakt-css'>${css || ''}</style>
      </head>
      <body>
        <div id="root" dangerouslySetInnerHTML={{ __html: content }} />
        <noscript id='rakt-cssids' data-cssids={JSON.stringify(ids)}/>
        <noscript id='rakt-ssr' data-ssr={JSON.stringify(hydrate)}/>
        {scripts.map(path => <script key={path} src={path} />)}
        <script dangerouslySetInnerHTML={{ __html: `window.__init()` }} />
      </body>
    </html>
  }
}