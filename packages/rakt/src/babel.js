let babylon = require('babylon');
let hash = require('glamor/lib/hash').default

let nodepath = require('path')

function hashify(path){
  return hash(path).toString(36)
}


// todo - implement warnings for - 
// NB: for great perf, `path` and `module` must be string literals, 
// and `render`/`children` should not be spread as `{...props}`


function wrap(SOURCE, name, absolute, server, defer, leaf, preserve) {
  let hashed = hashify(absolute); 
  let path = JSON.stringify(name);
  // todo - use imports instead of requires 
  // todo - defet / leaf / preserve should work with expression containers 
  return `require('rakt').wrap(${SOURCE}, { 
    ${defer === null ? `defer: true,` : ''}
    ${leaf === null ? `leaf: true,` : ''}
    ${preserve === null? `preserve: true,` : ''}
    module: ${path}, 
     ${server ? `absolute: '${absolute}',` : ''}
    load: done =>
      require('rakt').ensure(require.resolveWeak(${path}), 
        () => require.ensure([], require => require(${path}), '${hashed}'),  
        done)      
  })`;
}

// don't add new props or anything here 
// else render/children will behave differently 

let defaultSrc = `require('rakt').defaultRender`

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

        if (path.node.openingElement.name.name === 'Route') {
          // todo - make sure module is a string 
          // todo - make sure path is a static string (for SSR)
          // todo - export name 
          // todo - defer 

          // if component, throw error
          // if render, wrap
          // if children, wrap
          // else, send own render prop
          let attrModule = getAttr('module');
          let attrComponent = getAttr('component')
          if(attrModule && attrComponent){
            throw new Error('cannot use module and component together')
          }
          
          if(attrModule){
            let attrRender = getAttr('render');
            let attrDefer = getAttr('defer')
            let attrLeaf = getAttr('leaf')
            let attrPreserve = getAttr('preserve')
            let attrChildren = path.node.children.filter(attr => attr.type !== 'JSXText')[0];
            // todo ^ - make this better 
            let absolute = require.resolve(
              nodepath.join(nodepath.dirname(path.hub.file.opts.filename), attrModule.value))

            
            
            ;[attrRender, attrChildren].forEach(X => {

              let pts = X ? (X.expression ? X.expression : X) : X
              let xSrc = X ? 
                src.substring(pts.start, pts.end) : 
                defaultSrc;
              let wrapped = X ? wrap(xSrc, attrModule.value, absolute, state.opts.server, attrDefer, attrLeaf, attrPreserve) : null;
              if (wrapped) {
                X.expression = babylon.parse(wrapped, {
                  plugins: [ '*' ]
                }).program.body[0].expression;
              }
            })  

            if(!attrRender && !attrChildren){
              let wrapped = wrap(defaultSrc, attrModule.value, absolute, state.opts.server, attrDefer, attrLeaf, attrPreserve) // todo - 
              path.node.openingElement.attributes.push(t.jSXAttribute(t.jSXIdentifier('render'), 
                  t.jSXExpressionContainer(babylon.parse(wrapped, {
                  plugins: [ '*' ]
                }).program.body[0].expression) 
               ))  
            }                            
          }                     
        }
      },
      ClassDeclaration(path){
        // test if react component 
        let decorators = path.node.decorators
        if(decorators){
          
          let dataDeco = decorators.filter(x => x.expression.type === 'CallExpression' && x.expression.callee.name === 'initial')[0]
          if(dataDeco){            
            let modPath = path.hub.file.opts.filename            
            dataDeco.expression.arguments.push(t.StringLiteral(hashify(modPath)))
          }
        }
      }      
    }    
  }
};
 


// @middleware(({ req, res, next }) => {
//   req.user = require('decodeCookie')(req.cookies)
//   next()
// })
// class App extends React.Component{
//   render() {
//     return <Profile/>   
//   }
// }

// @data(async ({ req, res }) => {
//   return await require('mongo')(3111).get('users', req.user)
// })
// class Profile extends React.Component{
//   render() {
//     return <div>
//       {JSON.stringify(this.props.data)}
//     </div>
//   }
// }