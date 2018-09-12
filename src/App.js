import React from 'react';
import './App.css';

import SignIn from './SignIn';
import Layout from './Layout';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {path: window.location.pathname.substr(1).toLowerCase().split('/')};
    }

    render() {
        let parentPath = [this.state.path[0]];
        let path = this.state.path.slice(1);
        console.log(this.state.path);
        if (parentPath[0] === 'teacher')
            return <Layout isTeacher={true} path={path} parentPath={parentPath}/>;
        else if (parentPath[0] === 'student')
            return <Layout isTeacher={false} path={path} parentPath={parentPath}/>;
        else
            return <SignIn path={path}/>;
    }
}

export default App;
