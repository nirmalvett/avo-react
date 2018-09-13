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
            color: green,
            theme: 'light',
            authenticated: null,
            username: '',
            password: ''
        };
        Http.getUserInfo(
            () => {this.setState({authenticated: true});},
            () => {this.setState({authenticated: false});}
        );
    }

    render () {
        if (this.state.authenticated === null)
            return <p>Loading...</p>;
        return (
            <MuiThemeProvider theme={createMuiTheme({palette: {primary: this.state.color, type: this.state.theme}})}>
                {
                    this.state.authenticated
                        ? <Layout setTheme={(color, theme) => this.setState({color: color, theme: theme})}
                                  logout={() => this.setState({authenticated: false})}
                                  isTeacher={this.state.user === 1}/>
                        : <SignIn login={(u, p) => this.setState({authenticated: true, username: u, password: p})}
                                  username={this.state.username} password={this.state.password}/>
                }
            </MuiThemeProvider>
        );
    }
}