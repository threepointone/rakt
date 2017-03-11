rakt
---

[work in progress. come back when it's done!]

a framework, without any framework. for react/dialects. in a box.

usage 
--- 

`npm install rakt -g`

quick start
---
make a script, say `index.js`
```jsx
export default App = () => 
  <div>hello world</div>
```

then run 

```
$ rakt index.js   
```

the big idea 
---

one addition to [react-router's](http://react-router.now.sh/) `<Route/>` api

```diff
import { Route } from 'react-router'
- import User from './user.js'

<Route path='/user/:id'
-  component={User}
+  module='./user.js'
/>
```

behind the scenes, rakt handles code splitting + SSR + resource loading

optionally, use `render`/`children` as you normally would

```jsx
<Route path='/user/:id'
  module='./user.js'
  render={ ({ Module }) => Module ? 
    <Module.Profile /> : 
    <span>loading...</span> )}
/>
``` 

defer
---

you can prevent ssr for a `<Route/>` with the `defer` attribute. great for starting apps faster, and offloading some work to the browser. rakt manages efficiently preloading code and data for the same.  
```jsx
<Route path='/user/:id'
  module='./user.js'
  defer
/>

```

todo - `<Defer/>`


leaf
---

[todo]


preserve
---

[todo]


data fetching
---

rakt takes data-fetching to the next level, by letting you 
colocate *actual* server side code alongside your component

```jsx
import { initial } from 'rakt'

@initial(({ req, done }) => {    
  let db = require('mongo')(3111)
  db.get('users', req.params.id, done)  
  // gets removed from client side bundle(!)
})
export default class User {
  render(){
    return <div>
      {this.props.data || 'loading data'}
    </div>  
  }  
}

// augment this with your own solutions - relay, redux, etc
```

rakt will take care of efficiently fetching, hydration(for ssr), caching, etc

- todo - `@get`, `@post`, `@put`, `@del`
- todo - `@socket`, `@sse`, `@memory`, etc 
- todo - cache keys / idents 

css
---

[todo]

rakt lets you write 'inline' css via [glamor](https://github.com/threepointone/glamor/blob/master/docs/createElement.md)
```jsx
<div css={{ color: 'red' }}>
  bloody valentine
</div>
```


prpl ootb
---

[todo]

rakt apps should conform to the prpl pattern without any extra work


cli
---

[todo]

`rakt <script> <options>`

`rakt build <script> path/to/folder`

options 

- `ssr` - server side rendering - default `true`
- `splits` - code splits - default `true`
- `production` - production mode - default `false`
- `css` - 'inline' css - default `true`


integrating with other apps/frameworks
---

[todo]

you can take pieces from rakt and use them in your own app sans the rakt stack. 

- babel/webpack pipeline
- `<Layout/>`
- api server 
- route-aware data fetcher 

implementation
---

[todo]

constraints
---
- `module` must be a string literal
- when using `module`, `path` must be a string literal
- *might* overfetch data for some edge cases 

todo - 

- prefetch links
- websockets?
- work with aliased modules 
- sw-precache, etc
- use named exports (incl data fetches)
- manifest and such
- progressive css
- leaf nodes / wc-like behavior 
- cache keys for @initial
- react-native? 
- in-house `<Route/>`, `<Link/>`, etc 
- optimistic updates
- rhl


