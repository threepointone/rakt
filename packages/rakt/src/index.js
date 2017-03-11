import React, { PropTypes } from "react";
let isBrowser = typeof window !== "undefined";
import { withRouter, matchPath } from 'react-router'

let nodeRequire = !isBrowser && (() => eval('require'))() //eslint-disable-line no-eval 
// todo - a better solution for ^


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

// todo - load this only if there are data fetching components 
// in the bundle 
@withRouter
export class Rakt extends React.Component{
  static displayName = 'Rakt'
  static childContextTypes = {
    rakt: PropTypes.object
  }
  
  inflight = {}
  cache = this.props.cache
  errors = this.props.errors || {}
  url(){
    return this.props.history.createHref(this.props.location)  
  }
  getChildContext(){
    return {
      rakt: {
        fetch: (mod, fn) => {
          // if already in flight, attach to that instead
          let url = this.url()
          if(this.inflight[`${mod}:${url}`]){
            this.inflight[`${mod}:${url}`].then(x => fn(undefined, x), fn)
            return 
          }

          this.inflight[`${mod}:${url}`] = fetch(`/api/${mod}${url}`)
            .then(x => x.json())
            .then(res => {
              this.inflight[`${mod}:${url}`] = undefined
              this.cache[`${mod}:${url}`] = res
              fn(undefined, res)
            }, error => {
              this.inflight[`${mod}:${url}`] = undefined
              this.errors[`${mod}:${url}`] = error
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
        }
      }
    }
  }
  componentWillUnmount(){
    // unlisten history 
  }
  componentDidMount(){
    // this is the bit that lets you request for data for a module, 
    // *before* the chunk even arrives 
    this.props.history.listen(location => {
      
      let url = this.props.history.createHref(location)        

      let matches = this.props.routes
        .filter(({path, exact, strict}) => matchPath(url, path, {exact, strict})) // todo - fix basename        
        .filter(({ initial, hash }) => 
          !!initial && 
          !__webpack_modules__[hash] &&     //eslint-disable-line no-undef // todo - this is wrong
          !this.inflight[`${hash}:${url}`] && 
          !this.cache[`${hash}:${url}`]) 
        
        
      // todo - dedupe 
      let promises = matches.map(({ hash }) => fetch(`/api/${hash}${url}`).then(x => x.json()))
      
      // update inflight 
      promises.forEach((x, i) => this.inflight[`${matches[i].hash}:${url}`] = x)

      Promise.all(promises)
        .then(results => results.forEach((result, i) => {
          this.cache[`${matches[i].hash}:${url}`] = result
          this.inflight[`${matches[i].hash}:${url}`] = undefined 
        })) 
        
    })    
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
      static modhash = modhash
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

// todo - weakmap cache on fn 
export function wrap(fn, { module, load, defer, leaf, preserve, absolute }) {
  return ({ match, history }) => {
    
    if (!isBrowser) {
      // todo - defer  
      if(defer){
        return <Loading
          key={module}          
          fn={fn}
          args={{ match, history }}
        />
      }
      
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


export function defaultRender({ Module, match, ...rest }) {
  return (match && Module) ? 
    (Module.default ? 
      <Module.default match={match} {...rest} /> : 
      <Module match={match} {...rest} />) : 
    null
}
