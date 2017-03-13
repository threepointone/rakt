/* global $ENTRY $ROUTES */


import React from 'react'
import { render } from 'react-dom'
import { Rakt } from './'
import { BrowserRouter } from 'react-router-dom'

function dehydrate(name){
  return JSON.parse(document.getElementById(`rakt-${name}`).dataset[name])
}


let App = require($ENTRY)
App = App.default || App

// do anything else critical here 
// service worker registration etc 
// if ssr was off, you could start right away 

window.__init = () => 
  render(<BrowserRouter>
    <Rakt cache={dehydrate('ssr')} routes={$ROUTES}>
      <App/>
    </Rakt>
  </BrowserRouter>, document.getElementById('root'))