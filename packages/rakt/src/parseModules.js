var glob = require("glob")
import path from 'path'
let hash = require('glamor/lib/hash').default

function hashify(path){
  return hash(path).toString(36)
}

let cache = {}

module.exports = function(entry){
  if(cache[entry]){
    return cache[entry]
  }
  let ret = {}
  let dir = path.dirname(entry)
  let files = glob.sync(`${dir}/*.js`, {})
  files.forEach(file => ret[hashify(file)] = file)  
  cache[entry] = ret 
  return ret  
}