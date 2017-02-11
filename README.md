rakt
---

[work in progress. come back when it's done!]

a framework. for react/dialects. in a box.

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

we augment react-router's `<Route/>` api with one change

```diff
- import User from './user.js'
<Route path='/user/:id'
-  component={User}
+  module='./user.js'
/>
```

optionally, use `render`/`children` as you normally would

```jsx
<Route path='/user/:id'
  module='./user.js'
  render={ ({ Module }) => Module ? 
    <Module.Profile /> : 
    <span>loading...</span> )}
/>
``` 

- no new apis(!)
- handles code splitting, SSR, css, behind the scenes 
- <2k gz. for reals. 


NB: `path` and `module` must be string literals, and `render`/`children` 
should not be spread as `{...props}`


css
---

[todo]

rakt lets you write 'inline' css via [`glamor/createElement`](https://github.com/threepointone/glamor/blob/master/docs/createElement.md)


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

NB - *don't* declare/import any 'serverside only' dependencies outside the 
`@initial` decorator. 

- todo - `@post`, `@put`, `@del`
- todo - `@socket`, `@sse`, `@memory`, etc 
- todo - cache keys / idents 

prpl ootb
---

[todo]

rakt apps should conform to the prpl pattern without any extra work


cli
---

[todo]

### `rakt <script> <options>`
### `rakt build <script> path/to/folder`

- `ssr` - server side rendering - default `true`
- `splits` - code splits - default `true`
- `production` - production mode - default `false`
- `css` - 'inline' css - default `true`


integrating with other apps/frameworks
---

you can take pieces from rakt and use them in your own app sans the rakt stack. 

[todo]

- babel plugins
- `<Layout/>`
- api server 
- route-aware data fetcher 
- build system

todo - 

- prefetch links
- websockets?
- work with aliased modules 
- preserve server side rendered html while module asyncly loads 
- sw-precache, etc
- use named exports (incl data fetches)
- manifest and such
- progressive css
- obscure paths in output 
- webpack for server side code too?
- leaf nodes / wc-like behavior 
- cache keys for @initial
- react-native? 
- in-house `<Route/>`, `<Link/>`, etc 