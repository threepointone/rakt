var glob = require("glob")
import path from 'path'
import fs from 'fs'
import * as babylon from 'babylon'
let hash = require('glamor/lib/hash').default

function hashify(path){
  return hash(path).toString(36)
}

module.exports = function(entry){
  // let ret = {
  //   'route': [m1, m2]
  // }
  let ret = {}
  let dir = path.dirname(entry)
  let files = glob.sync(`${dir}/*.js`, {})
  files.forEach(file => {
    let src = fs.readFileSync(file)
    babylon.parse(src, {
      JSXElement({ node }){
        
        function getAttr(name) {
          let ret = path.node.openingElement.attributes.filter(
            attr => attr.name.name === name
          )[0];
          ret = ret ? ret.value : undefined;
          return ret;
        }

        if (node.openingElement.name.name === "Route") {
          let module = getAttr("module");
          let path = getAttr("path");
          let exact = getAttr("exact");
          let strict = getAttr("strict");
          ret.push({ module, path, exact, strict })
        }
      }
    })
  })

  return ret  
}