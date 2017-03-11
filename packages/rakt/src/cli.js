#! /usr/bin/env node
let path = require('path')

require('babel-register')({
  "presets": [ "es2015", "stage-0", "react" ],
  "plugins": [ [require.resolve("./babel.js"), { server: true }], "transform-decorators-legacy" ]  
})

let server = require('./server').default
let serve = server({ entry: require.resolve(path.resolve(process.argv[2])) })

serve.listen(3000, err => {
  if(err){
    return console.error(err)  
  }
  console.log('listening on', 3000)
  
})