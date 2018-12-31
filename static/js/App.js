import React, { Component } from 'react';
import Http from './Http';
import Layout from './Layout.js';
import SignIn from './SignIn.js';
import MomentUtils from '@date-io/moment';
import PasswordResetPage from './passwordReset';
import { isChrome, isSafari } from "./helpers";
import { unregister } from './registerServiceWorker';
import NotChromeWarningPage from "./NotChromeWarningPage";
import { MuiPickersUtilsProvider } from 'material-ui-pickers';

unregister();
export default class App extends Component {
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
        if (!isChrome() && !isSafari()){
            return (<NotChromeWarningPage/>)
        }
        if (this.state.authenticated === null)
            return null;
        let u = this.state.user;
        if(window.location.href.indexOf('passwordReset') > -1) {
            return <PasswordResetPage/>;
        } 
        return (
            <MuiPickersUtilsProvider utils={MomentUtils}>{
                this.state.authenticated
                    ? <Layout setTheme={(color, theme) => this.setState({color: color, theme: theme})}
                              logout={() => this.setState({authenticated: false})}
                              firstName={u.firstName} lastName={u.lastName} isTeacher={u.isTeacher}
                              isAdmin={u.isAdmin} color={u.color} theme={u.theme}
                    />
                    : <SignIn login={(u, p, result) => this.updateUser(u, p, result)}
                              username={this.state.username} password={this.state.password}/>
            }</MuiPickersUtilsProvider>
        );
    }

    updateUser(u, p, result) {
        this.setState({
            authenticated: true,
            username: u,
            password: p,
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
