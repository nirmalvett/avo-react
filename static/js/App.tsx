import React, {Component} from 'react';
import * as Http from './Http';
import Layout from './Layout/Layout';
import SignIn from './SignIn/SignIn';
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
                    setColor={(color: number) => this.setState({user: {...u, color}})}
                    setTheme={(theme: 'light' | 'dark') => this.setState({user: {...u, theme}})}
                    logout={() => this.setState({authenticated: false})}
                    {...u}
                />
            );
        } else {
            return (
                <SignIn
                    login={this.updateUser}
                    username={this.state.username}
                    password={this.state.password}
                />
            );
        }
    }

    updateUser = (username: string, password: string, result: Http.GetUserInfo) => {
        this.setState({
            authenticated: true,
            username,
            password,
            user: {...result, theme: result.theme ? 'dark' : 'light'},
        });
    }
}

export default connect()(App);
