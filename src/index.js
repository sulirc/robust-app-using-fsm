/* eslint-disable */
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// Normal demo
import AppRaw from './App.raw';
// Normal full demo
import AppRawFull from './App.raw.full';
// FSM demo
import App from './App';
// XState demo
import AppXState from './App.xstate';

import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  // <AppRaw />,
  // <AppRawFull />,
  // <App />,
  <AppXState />,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
