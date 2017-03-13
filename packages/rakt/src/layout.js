import { template } from 'rapscallion'

export const layout = (element, {scripts, stylesheets, deferred, hydrate} ) => template`
  <!doctype html>
  <html>
    <head>
      <link rel="shortcut icon" href="/favicon.ico" />
      <meta name="viewport" content="width=device-width, initial-scale=1" /> 
      ${scripts.map(path => `<link rel='preload' href='${path}' as='script' />`).join('')}
      ${stylesheets.map(path => `<link rel='stylesheet' href='${'/' + path}' />`).join('')}
      ${deferred.map(({ script, data }) => 
        `<link rel='preload' href='${script}' as='script'/>`).join('')}
    </head>
    <body>
      <div id='root'>
        ${element}
      </div>
      <noscript id='rakt-ssr' data-ssr='${JSON.stringify(hydrate)}'></noscript>
      ${scripts.map(path => `<script src='${path}' ></script>`).join('')}
      <script>window.__init()</script>
    </body>
  </html>
`

