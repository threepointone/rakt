// https://chime.social/

import React from 'react'
import { Route, Switch, Link } from "react-router-dom";

export default class App extends React.Component {
  render() {
    return (
      <div>
        <ul>
          <li><Link to="/">home</Link></li>
          <li><Link to="/a">to a</Link></li>
          <li><Link to="/b">to b</Link></li>
          <li><Link to="/c">to c</Link></li>
          <li><Link to="/asd">404</Link></li>
        </ul>
        <Route path="/" exact>
            {({ match }) =>
              match
                ? <span> home sweet home </span>
                : <span> searching... </span>}
          </Route>
        <Switch>
          
          <Route
            path="/a"
            defer
            exact
            module="./a.js"            
          />
          <Route
            path="/b"
            exact
            defer
            module="./b.js"
            render={({ Module }) => Module ? <Module.B /> : <span> loading... </span>}
          />
          <Route
            path="/c"
            exact
            module="./c.js"
            leaf          
          >{({ Module }) => Module ? <Module.default /> : <span> loading... </span>}</Route>
          <Route render={() => <span>no match</span>} />
        </Switch>
      </div>
    );
  }
}