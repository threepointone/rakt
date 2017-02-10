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


render(<BrowserRouter basename='/app'>
  <Rakt>
    <div>
      <Helmet title="Home" />
      <App/>
    </div>
  </Rakt>
</BrowserRouter>, document.getElementById('root'))