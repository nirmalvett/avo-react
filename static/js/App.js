import React from 'react';
import Http from './Http';
import SignIn from './SignIn.js';
import Layout from './Layout.js';
import { unregister } from './registerServiceWorker';
unregister();
export default class App extends React.Component {
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
        if (this.state.authenticated === null)
            return null;
        let u = this.state.user;
        return (
            this.state.authenticated
                ? <Layout setTheme={(color, theme) => this.setState({color: color, theme: theme})}
                          logout={() => this.setState({authenticated: false})}
                          firstName={u.firstName} lastName={u.lastName} isTeacher={u.isTeacher}
                          isAdmin={u.isAdmin} color={u.color} theme={u.theme}
                />
                : <SignIn login={(u, p, result) => this.updateUser(u, p, result)}
                          username={this.state.username} password={this.state.password}/>
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