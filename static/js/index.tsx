import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import '../css/app.css';
require('../css/app.css');
import {unregister} from './serviceWorker';

unregister();
ReactDOM.render(<App />, document.getElementById('root'));
