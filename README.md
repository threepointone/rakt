rakt
---

[work in progress.]

a framework. for react/dialects. in a box.

usage 
--- 

`npm install rakt -g`

quick start
---

```jsx
// index.js
export default App = () => 
  <div>hello world</div>
```

and then run 

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

- no new imports/apis, everything works as usual
- renders default export by default 
- handles code splitting, SSR, css, behind the scenes 
- works with `render`, `children` props as expected 


```jsx
<Route path='/user/:id'
  module='./user.js'
  render={ ({ Module }) => Module ? 
    <Module.Profile /> : 
    <span>loading...</span> )}
/>
``` 

data fetching
---

```jsx
// user.js
import { initial } from 'rakt'

@initial(({ req, done }) => {  
  // write server side friendly code here 
  // gets removed from client side bundle
  let db = require('mongo')(3111)
  db.get('users', req.params.id, done)  
})
export default class User {
  render(){
    return <div>
      {this.props.data || 'loading data'}
    </div>  
  }
  
// ... that's it! we'll take care of setting up 
// endpoints, hydrating, etc
// - starts loading data *before* the component has loaded 
// you're free to augment with your own systems 
// - relay, redux, whatevs 


```

- todo - `@post`, `@put`, `@del`
- todo - `@socket`, `@sse`, `@memory`, etc 

prpl ootb
---

[todo]


configuration
---

[todo]


integrating with other apps/frameworks
---

you can take pieces from rakt and use them in your own app sans the rakt stack. 

[todo]


todo - 

- auto endpoints for data fetching 
- prefetch links
- websockets?
- work with aliased modules 
- preserve server side rendered html while module asyncly loads 
- `<Html/>`, `<Head/>`, `<Document/>`
- service workers
- all that jazz
- use named exports (incl data fetches)
- manifest and such
- progressive css
- obscure paths in output 
