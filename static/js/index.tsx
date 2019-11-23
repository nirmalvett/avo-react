import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
require('../css/app.scss');
require('../favicon.ico');
import {unregister} from './serviceWorker';

unregister();
ReactDOM.render(<App />, document.getElementById('root'));
