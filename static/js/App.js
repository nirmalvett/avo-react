import React from 'react';

import SignIn from './SignIn.js';
import Layout from './Layout.js';
import {createMuiTheme, MuiThemeProvider} from '@material-ui/core';
import {green} from "@material-ui/core/colors";

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            path: window.location.pathname.substr(1).toLowerCase().split('/'),
            color: green,
            theme: 'dark',
        };
    }

    render () {
        console.log(this.state.path);
        return (
            <MuiThemeProvider theme={this.getTheme()}>
                {this.getContent()}
            </MuiThemeProvider>
        );
    }

    getTheme() {
        return createMuiTheme({palette: {primary: this.state.color, type: this.state.theme}});
    }

    setTheme(color, theme) {
        this.setState({color: color, theme: theme});
    }

    getContent() {
        let parentPath = this.state.path[0];
        let path = this.state.path.slice(1);
        if (parentPath === 'teacher')
            return <Layout path={path} parentPath={parentPath} setTheme={this.setTheme} isTeacher={true}/>;
        if (parentPath === 'student')
            return <Layout path={path} parentPath={parentPath} setTheme={this.setTheme} isTeacher={false}/>;
        if (parentPath === 'signin')
            return <SignIn path={path} parentPath={parentPath} setTheme={this.setTheme}/>;
        window.history.pushState({}, null, '/signin');
        this.setState({path: ['signin']});
    }
}