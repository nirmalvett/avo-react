import React from 'react';
import './App.css';

import SignIn from "./SignIn";
import Layout from "./Layout";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {path: window.location.pathname.substr(1).split('/')};
    }

    render() {
        let path = this.state.path.slice(1);
        if (this.state.path[0] === 'Teacher')
            return <Layout path={path}/>;
        else
            return <SignIn path={path}/>;
    }
}

export default App;
