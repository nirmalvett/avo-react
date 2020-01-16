import React, {Component, Suspense} from 'react';
import * as Http from './Http';
import Layout from './Layout/Layout';
import {isChrome, isMobile, isSafari} from './HelperFunctions/Helpers';
import MomentUtils from '@date-io/moment';
import {MuiPickersUtilsProvider} from '@material-ui/pickers';
import {createMuiTheme, MuiThemeProvider, Typography} from '@material-ui/core';
import {colorList} from './SharedComponents/AVOCustomColors';

const SignIn = React.lazy(() => import('./SignIn/SignIn'));
const PasswordResetPage = React.lazy(() => import('./SignIn/PasswordReset'));
const NotChromeWarningPage = React.lazy(() => import('./SignIn/NotChromeWarningPage'));


export interface User {
    firstName: string;
    lastName: string;
    isTeacher: boolean;
    isAdmin: boolean;
    color: number;
    theme: 'dark' | 'light';
}

interface AppProps {
}

interface AppState {
    authenticated: User | false | null;
}

export default class App extends Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.state = {
            authenticated: null,
        };
    }

    componentDidMount() {
        Http.getUserInfo(this.updateUser, this.authError);
    }

    render() {
        if (!isChrome() && !isMobile()) {
            return <NotChromeWarningPage/>;
        } else if (this.state.authenticated === null) {
            return null;
        } else {
            return (
                <MuiPickersUtilsProvider utils={MomentUtils}>
                    <Suspense fallback={<div>Loading...</div>}>
                        {this.getContent()}
                    </Suspense>
                </MuiPickersUtilsProvider>
            );
        }
    }

    getContent() {
        if (window.location.pathname.startsWith('/passwordReset/')) {
            return (
                <PasswordResetPage token={window.location.pathname.substr(15)} showTerms={false}>
                    <Typography variant='h5'>Change Password</Typography>
                </PasswordResetPage>
            );
        } else if (window.location.pathname.startsWith('/setup/')) {
            return (
                <PasswordResetPage token={window.location.pathname.substr(7)} showTerms={true}>
                    <Typography variant='h5'>Create a password</Typography>
                </PasswordResetPage>
            );
        } else if (this.state.authenticated === false) {
            return <SignIn login={this.updateUser}/>;
        } else {
            const u = this.state.authenticated as User;
            const theme = createMuiTheme({palette: {primary: colorList[u.color], type: u.theme}});
            return (
                <MuiThemeProvider theme={theme}>
                    <Layout
                        setColor={this.setColor}
                        setTheme={this.setTheme}
                        logout={this.logout}
                        {...u}
                    />
                </MuiThemeProvider>
            );
        }
    }

    updateUser = (result: Http.GetUserInfo) =>
        this.setState({authenticated: {...result, theme: result.theme ? 'dark' : 'light'}}, () => {
            Http.collectData('login', {}, ()=>{}, console.warn)
        });

    authError = () => this.setState({authenticated: false});

    logout = () => this.setState({authenticated: false});

    setColor = (color: number) => () =>
        this.setState({authenticated: {...(this.state.authenticated as User), color}});

    setTheme = (theme: 'light' | 'dark') => () =>
        this.setState({authenticated: {...(this.state.authenticated as User), theme}});
}
