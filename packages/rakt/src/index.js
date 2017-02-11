import React, { PropTypes } from "react";
let isBrowser = typeof window !== "undefined";
import { withRouter } from 'react-router'
let nodeRequire = !isBrowser && (() => eval('require'))()


export class Loading extends React.Component {
  state = { error: undefined, Module: undefined };
  componentDidMount() {
    this.props.listen((type, x) => {
      this.setState({ [type]: x });
    });
  }
  // component will recieve props?
  componentWillUnmount() {
    this.props.unlisten();
  }
  render() {
    let { match, history } = this.props.args;
    let { error, Module } = this.state;
    return this.props.fn({ match, history, error, Module });
  }
}

@withRouter
export class Rakt extends React.Component{
  static displayName = 'Rakt'
  static childContextTypes = {
    rakt: PropTypes.object
  }
  
  inflight = {}
  cache = this.props.cache
  errors = {}
  url(){
    return this.props.createHref(this.props.location)  
  }
  getChildContext(){
    return {
      rakt: {
        fetch: (mod, fn) => {
          // if already in flight, attach to that instead
          // if(this.inflight[`${mod}:${this.state.url}`]){
          //   this.inflight[`${mod}:${this.state.url}`].push(fn)
          //   return 
          // }
          fetch(`/api/${mod}${this.url()}`)
            .then(x => x.json())
            .then(res => {
              
              this.cache[`${mod}:${this.url()}`] = res
              fn(undefined, res)
            }, error => {
              this.errors[`${mod}:${this.url()}`] = error
              fn(error)
            })          
        },
        get: (mod) => {
          return this.cache[`${mod}:${this.url()}`]
        },        
        getError: (mod) => {
          return this.errors[`${mod}:${this.url()}`]
        },        
        clear: () => {
          this.cache = {}
          // this.setState({ cache: this.cache })
        }
      }
    }
  }
  componentWillUnmount(){
    
  }
  componentDidMount(){
    // this is the bit that lets you request for data for a module, before the chunk even arrives 
    // this.context.history.listen(url => {
    //   let matches = this.props.routes
    //     .filter(({pattern, exact, strict}) => matchPath(this.state.url, pattern, {exact, strict}))
    //     .filter(({ moduleId }) => !__webpack_modules__[moduleId]) //eslint-disable-line no-undef
    //     .filter(({ moduleId }) => !this.inflight[`${moduleId}:${url}`])
    //     // todo - dedupe 
    //   matches.forEach(({ moduleId }) => this.inflight[`${moduleId}:${url}`] = [])

    //   Promise.all(matches.map(({ moduleId }) => fetch(`/api/${moduleId}${url}`)))
    //     .then(results => results.forEach((result, i) => {
    //       this.cache[`${matches[i].moduleId}:${url}`] = result
    //       this.inflight[`${matches[i].moduleId}:${url}`].forEach(l => l(undefined, result))
    //       this.inflight[`${matches[i].moduleId}:${url}`] = undefined 
    //     })) 
        
    // })
    // listen on url changes 
    // find mods which haven't loaded yet
    // make requests 
    // fill cache
    // intercept possible requests once module loads 
  }
  render(){
    return this.props.children
  }
}

export function initial(mod, modhash){ // assuming this has been transpiled to an indentifier mod 
  if(isBrowser && (typeof mod === 'function')){
    throw new Error('forgot to apply babel plugin')
  }
  // get hash 
  return Target => {
    
    return class Data extends React.Component{      
      static mod = mod
      static contextTypes = {
        rakt: PropTypes.object
      }
      state = {
        data: this.context.rakt.get(!isBrowser ? modhash : mod), 
        error: this.context.rakt.getError(!isBrowser ? modhash : mod)
      }
      
      componentDidMount(){
        if(!this.state.data && !this.state.error) {
          this.context.rakt.fetch(!isBrowser ? modhash : mod, (error, data ) => {
            this.setState({ error, data})
          })
        }
      }
      
      render(){
        if(this.state.error){
          return <Target error={this.state.error} {...this.props} />
        }
        return <Target data={this.state.data} {...this.props} />
      }
    }
  }
}

export function post(mod){

}

export function put(mod){

}

export function del(mod){

}

export function ensure(moduleId, fn, done){
  if(__webpack_modules__[moduleId]) {       //eslint-disable-line no-undef
    return done(undefined, __webpack_require__(moduleId))        //eslint-disable-line no-undef
  } 
  fn().then(Module => done(undefined, Module), done)
}

export function wrap(fn, { module, load, defer, absolute }) {
  return ({ match, history }) => {
    
    if (!isBrowser) {
      // todo - defer      
      
      let Module = match ? nodeRequire(absolute) : undefined;
      return fn({ match, history, Module });
    }
    let Module, sync = true, error;
    let listeners = [],
      listen = fn => listeners.push(fn),
      unlisten = () => listeners = [];

    
    if(!match){
      return fn({ match, history })
    }    

    load((err, loaded) => {
      if (err) {
        // todo - retry?
        if (sync) {
          error = err;
        } else {
          listeners.forEach(x => x("error", err));
        }
        return;
      }
      if (sync) {
        Module = loaded;
      } else {
        listeners.forEach(x => x("Module", loaded));
      }
    });
    sync = false;
    if (error || Module) {
      return fn({ match, history, Module, error });
    } else return (
        <Loading
          key={module}
          listen={listen}
          unlisten={unlisten}
          fn={fn}
          args={{ match, history }}
        />
      );
  };
}
