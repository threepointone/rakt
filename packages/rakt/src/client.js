/* global $ENTRY */

import React from 'react'
import { render } from 'react-dom'
import { Rakt } from './'
import { BrowserRouter } from 'react-router-dom'
import Helmet from 'react-helmet'

import { rehydrate } from 'glamor'
rehydrate(JSON.parse(document.getElementById('css-ids').dataset.ids))

let App = require($ENTRY)
App = App.default || App

// do anything else critical here 

window.startup = () => 
  render(<BrowserRouter basename='/app'>
    <Rakt cache={JSON.parse(document.getElementById('rakt-ssr').dataset.ssr)}>
      <div>
        <Helmet title="Home" />
        <App/>
      </div>
    </Rakt>
  </BrowserRouter>, document.getElementById('root'))