import React from 'react';

import SignIn from './SignIn.js';
import Layout from './Layout.js';
import {createMuiTheme, MuiThemeProvider} from '@material-ui/core';
import {green} from "@material-ui/core/colors";
import Http from "./Http";

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
        if (parentPath === 'teacher') {
            Http.getUserInfo(
                (result) => {
                    if (result.is_teacher)
                        return <Layout path={path} parentPath={parentPath} setTheme={this.setTheme} isTeacher={true}/>;
                    else
                        this.redirect('student/home');
                },
                () => {
                    this.redirect('signin');
                }
            );
        }
        if (parentPath === 'student') {
            Http.getUserInfo(
                () => <Layout path={path} parentPath={parentPath} setTheme={this.setTheme} isTeacher={false}/>,
                () => {
                    this.redirect('signin');
                }
            );
        }
        if (parentPath !== 'signin')
            this.redirect('signin');
        return <SignIn path={path} parentPath={parentPath} setTheme={this.setTheme}/>;
    }

    redirect(url) {
        window.history.pushState({}, null, '/' + url);
        this.setState({path: [url]});
    }
}