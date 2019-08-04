import React, {Component} from 'react';
import Http, {UserResponse} from './HelperFunctions/Http';
import Layout from './Layout/Layout.js';
import SignIn from './SignIn/SignIn.js';
import MomentUtils from '@date-io/moment';
import PasswordResetPage from './SignIn/PasswordReset';
import {isChrome, isSafari} from './HelperFunctions/Helpers';
import NotChromeWarningPage from './SignIn/NotChromeWarningPage';
import {MuiPickersUtilsProvider} from '@material-ui/pickers';
import {connect} from 'react-redux';
import {handleLoginData} from './Redux/Actions/shared';

interface AppProps {
    dispatch: (x: any) => void; // todo: figure out the correct signature
}

interface AppState {
    authenticated: boolean | null;
    username: string;
    password: string;
    user: User | null;
}

export interface User {
    firstName: string;
    lastName: string;
    isTeacher: boolean;
    isAdmin: boolean;
    color: number;
    theme: 'dark' | 'light';
}

class App extends Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.state = {
            authenticated: null,
            username: '',
            password: '',
            user: null,
        };
    }

    componentDidMount() {
        Http.getUserInfo(
            result => {
                this.props.dispatch(handleLoginData(result));
                this.updateUser('', '', result);
            },
            () => {
                this.setState({authenticated: false, user: null});
            },
        );
    }

    render() {
        if (!isChrome() && !isSafari()) {
            return <NotChromeWarningPage />;
        } else if (this.state.authenticated === null) {
            return null;
        } else {
            return (
                <MuiPickersUtilsProvider utils={MomentUtils}>
                    {this.getContent()}
                </MuiPickersUtilsProvider>
            );
        }
    }

    getContent() {
        const u = this.state.user as User;
        const urlContainsPasswordRest = window.location.href.indexOf('passwordReset') > -1;
        if (urlContainsPasswordRest) {
            return <PasswordResetPage />;
        } else if (this.state.authenticated) {
            return (
                <Layout
                    setTheme={(color: number, theme: 'light' | 'dark') =>
                        this.setState({user: {...u, color, theme}})
                    }
                    logout={() => this.setState({authenticated: false})}
                    firstName={u.firstName}
                    lastName={u.lastName}
                    isTeacher={u.isTeacher}
                    isAdmin={u.isAdmin}
                    color={u.color}
                    theme={u.theme}
                />
            );
        } else {
            return (
                <SignIn
                    login={(u: string, p: string, result: UserResponse) =>
                        this.updateUser(u, p, result)
                    }
                    username={this.state.username}
                    password={this.state.password}
                />
            );
        }
    }

    updateUser(username: string, password: string, result: UserResponse) {
        this.setState({
            authenticated: true,
            username,
            password,
            user: {
                // Todo: make this transformation unnecessary by changing the server
                firstName: result.first_name,
                lastName: result.last_name,
                isTeacher: result.is_teacher,
                isAdmin: result.is_admin,
                color: result.color,
                theme: result.theme ? 'dark' : 'light',
            },
        });
    }
}

export default connect()(App);
