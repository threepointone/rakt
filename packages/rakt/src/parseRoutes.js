var glob = require("glob")
import path from 'path'
import fs from 'fs'
import * as babylon from 'babylon'
import traverse from 'babel-traverse'
let hash = require('glamor/lib/hash').default

function hashify(path){
  return hash(path).toString(36)
}

function clean(obj){
  let ret = {}
  Object.keys(obj).forEach(key => {
    if(obj[key] !== undefined){
      if(obj[key] === null){
        ret[key] = true
        return  
      }
      ret[key] = obj[key]
    }
  })
  return ret 
}

module.exports = function(entry){
  let ret = []
  let dir = path.dirname(entry)
  let files = glob.sync(`${dir}/*.js`, {})
  files.forEach(file => {
    let src = fs.readFileSync(file, 'utf8')
    
    let ast = babylon.parse(src, {
      plugins: ['*'],
      sourceType: 'module'
    })
    
    traverse(ast, {
      enter({ node, type }){
        function getAttr(name) {
          let ret = node.openingElement.attributes.filter(
            attr => attr.name.name === name
          )[0];
          ret = ret ? ret.value : ret;
          ret = ret ? ret.value : ret; // not a typo. just a babel thing. 
          return ret;
        }

        if((type === 'JSXElement') && (node.openingElement.name.name === "Route")){ 
          let module = getAttr("module") 

          if(module){
            let modPath = path.join(dir, module)
            let mod = require(modPath)            
            mod = mod.default || mod 

            ret.push(clean({ 
              initial: (!!mod.mod) || undefined,
              module: modPath, 
              path: getAttr("path"), 
              exact: getAttr("exact"), 
              strict: getAttr("strict"),
              defer: getAttr("defer"),
              preserve: getAttr('preserve'),
              leaf: getAttr('leaf'),
              hash: hashify(path.join(dir, getAttr("module")))
            }))
          }
          
        }                  
      }      
    })
  })

  return ret  
}