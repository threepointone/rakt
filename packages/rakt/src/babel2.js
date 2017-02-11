let hash = require('glamor/lib/hash').default

function hashify(path){
  return hash(path).toString(36)
}


module.exports = function ({ types: t }) {
  return {
    visitor: {      
      ClassDeclaration(path){
        // test if react component 
        let decorators = path.node.decorators
        if(decorators){
          
          let dataDeco = decorators.filter(x => x.expression.type === 'CallExpression' && x.expression.callee.name === 'initial')[0]
          if(dataDeco){            
            
            let modPath = path.hub.file.opts.filename
            dataDeco.expression.arguments[0] = t.StringLiteral(hashify(modPath))            
          }
        }
      }
    }    
  }
};
 