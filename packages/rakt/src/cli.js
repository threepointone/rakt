#! /usr/bin/env node
require('babel-register')({
  "presets": [ "es2015", "stage-0", "react" ],
  "plugins": [ require.resolve("./babel.js"), "transform-decorators-legacy" ]  
})

let server = require('./server').default
let serve = server({ entry: require.resolve('../../rakt-example/src/index.js') })

serve.listen(3000, err => {
  if(err){
    return console.error(err)  
  }
  console.log('listening on', 3000)
  
})