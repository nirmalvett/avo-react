import React from 'react';
import './App.css';
import {BrowserRouter as Router, Route} from 'react-router-dom'

import SignIn from "./SignIn";
import Layout from "./Layout";

class App extends React.Component {
    render() {
        return (
            <Router>
                <div style={{position: 'fixed', height: '100vh', width: '100vw'}}>
                    <Route exact path='/' component={() => window.location.replace('SignIn')}/>
                    <Route path='/SignIn' component={() => <SignIn/>}/>
                    <Route path='/Teacher' component={() => <Layout/>}/>
                </div>
            </Router>
        )
    }
}

export default App;
