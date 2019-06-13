import React, { Component } from 'react';
import Http from './Http';
import Layout from './Layout.js';
import SignIn from './SignIn.js';
import MomentUtils from '@date-io/moment';
import PasswordResetPage from './PasswordReset';
import { isChrome, isSafari } from "./helpers";
import { unregister } from './registerServiceWorker';
import NotChromeWarningPage from "./NotChromeWarningPage";
import { MuiPickersUtilsProvider } from 'material-ui-pickers';

unregister();
export default class App extends Component {
    is_teacher; is_admin; // Putting this here makes the warnings go away

    constructor(props) {
        super(props);
        this.state = {
            authenticated: null,
            username: '',
            password: '',
            user: null,
        };
        Http.getUserInfo(
            result => this.updateUser('', '', result),
            () => {this.setState({authenticated: false, user: null});}
        );
    }

    render () {
        if (!isChrome() && !isSafari())
            return <NotChromeWarningPage/>;
        else if (this.state.authenticated === null)
            return null;
        else
            return <MuiPickersUtilsProvider utils={MomentUtils}>{this.getContent()}</MuiPickersUtilsProvider>;
    }

    getContent() {
        let u = this.state.user;
        const urlContainsPasswordRest = window.location.href.indexOf('passwordReset') > -1;
        if (urlContainsPasswordRest) return (
            <PasswordResetPage/>
        );
        else if (this.state.authenticated) return (
            <Layout
                setTheme={(color, theme) => this.setState({color: color, theme: theme})}
                logout={() => this.setState({authenticated: false})}
                firstName={u.firstName} lastName={u.lastName} isTeacher={u.isTeacher}
                isAdmin={u.isAdmin} color={u.color} theme={u.theme}
            />
        );
        else return (
            <SignIn
                login={(u, p, result) => this.updateUser(u, p, result)}
                username={this.state.username}
                password={this.state.password}
            />
        );
    }

    updateUser(username, password, result) {
        this.setState({
            authenticated: true,
            username,
            password,
            user: {
                firstName: result.first_name,
                lastName: result.last_name,
                isTeacher: result.is_teacher,
                isAdmin: result.is_admin,
                color: result.color,
                theme: result.theme ? 'dark' : 'light',
            }
        });
    }
}
