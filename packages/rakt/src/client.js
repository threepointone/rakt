/* global $ENTRY */

import React from 'react'
import { render } from 'react-dom'
import { Rakt } from './'
import { BrowserRouter } from 'react-router-dom'
import Helmet from 'react-helmet'

import { rehydrate } from 'glamor'
rehydrate(JSON.parse(window.getElementById('css-ids').dataset.ids))

const App = require($ENTRY)

render(<BrowserRouter basename='app'>
  <Rakt>
    <Helmet title="Home" />
    <App/>
  </Rakt>
</BrowserRouter>, document.getElementById('root'))