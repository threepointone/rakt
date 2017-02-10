var glob = require("glob")
import path from 'path'
let hash = require('glamor/lib/hash').default

function hashify(path){
  return hash(path).toString(36)
}

module.exports = function(entry){
  let ret = {}
  let dir = path.dirname(entry)
  let files = glob.sync(`${dir}/*.js`, {})
  files.forEach(file => ret[hashify(file)] = file)  
  return ret  
}