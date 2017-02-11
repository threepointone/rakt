let babylon = require("babylon");
let hash = require('glamor/lib/hash').default

let nodepath = require('path')

function hashify(path){
  return hash(path).toString(36)
}



function wrap(SOURCE, name, hashed, absolute) {
  let path = JSON.stringify(name);

  return `require('rakt').wrap(${SOURCE}, { 
    module:${path}, 
    absolute: ${JSON.stringify(absolute)},
    load: done =>
      require('rakt').ensure(require.resolveWeak(${path}), 
        () => require.ensure([], require => require(${path}), '${hashed}'),  
        done)      
  })`;
}

// don't add new props or anything here 
// else render/children will behave differently 

let defaultSrc = `({ Module, match, ...rest }) => (match && Module) ? 
  (Module.default ? 
    <Module.default match={match} {...rest} /> : 
    <Module match={match} {...rest} />) : 
  null`

module.exports = function ({ types: t }) {
  return {
    visitor: {
      JSXElement(path, state) {
        let src = path.hub.file.code;

        function getAttr(name) {
          let ret = path.node.openingElement.attributes.filter(
            attr => attr.name.name === name
          )[0];
          ret = ret ? ret.value : undefined;
          return ret;
        }

        if (path.node.openingElement.name.name === "Route") {
          // todo - make sure module is a string 
          // todo - make sure path is a static string (for SSR)
          // todo - export name 
          // todo - defer 

          // if component, throw error
          // if render, wrap
          // if children, wrap
          // else, send own render prop
          let attrModule = getAttr("module");
          let attrComponent = getAttr('component')
          if(attrModule && attrComponent){
            throw new Error('cannot use module and component together')
          }
          
          if(attrModule){
            let attrRender = getAttr("render");
            let attrChildren = path.node.children.filter(attr => attr.type !== 'JSXText')[0];
            // todo ^ - make this better 
            let absolute = require.resolve(
              nodepath.join(nodepath.dirname(path.hub.file.opts.filename), attrModule.value))

            let hashed = hashify(absolute); 
            
            [attrRender, attrChildren].forEach(X => {

              let pts = X ? (X.expression ? X.expression : X) : X
              let xSrc = X ? 
                src.substring(pts.start, pts.end) : 
                defaultSrc;
              let wrapped = X ? wrap(xSrc, attrModule.value, hashed, absolute) : null;
              if (wrapped) {
                X.expression = babylon.parse(wrapped, {
                  plugins: [ "*" ]
                }).program.body[0].expression;
              }
            })  

            if(!attrRender && !attrChildren){
              let wrapped = wrap(defaultSrc, attrModule.value, hashed, absolute) // todo - 
              path.node.openingElement.attributes.push(t.jSXAttribute(t.jSXIdentifier('render'), 
                  t.jSXExpressionContainer(babylon.parse(wrapped, {
                  plugins: [ "*" ]
                }).program.body[0].expression) 
               ))  
            }  
            
          path.node.openingElement.attributes.push(
            t.jSXAttribute(
              t.jSXIdentifier('absolute'), 
              t.StringLiteral(absolute)
            ))            
              
          }                     
        }
      }      
    }    
  }
};
 