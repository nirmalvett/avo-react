import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import '../css/app.css';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import reducer from './Redux/Reducers';
import middleware from './Redux/Middleware';
import {unregister} from './serviceWorker';
const store = createStore(reducer, middleware);
unregister();
ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root'),
);
