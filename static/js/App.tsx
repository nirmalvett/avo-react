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
import {User} from './Models';
import {createMuiTheme, MuiThemeProvider} from '@material-ui/core';
import {colorList} from './SharedComponents/AVOCustomColors';

interface AppProps {
    dispatch: (x: any) => void; // todo: figure out the correct signature
}

interface AppState {
    authenticated: User | false | null;
}

class App extends Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.state = {
            authenticated: null,
        };
    }

    componentDidMount() {
        Http.getUserInfo(
            result => {
                this.props.dispatch(handleLoginData(result));
                this.updateUser('', result);
            },
            () => {
                this.setState({authenticated: false});
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
        const urlContainsPasswordRest = window.location.href.indexOf('passwordReset') > -1;
        if (urlContainsPasswordRest) {
            return <PasswordResetPage />;
        } else if (this.state.authenticated === false) {
            return <SignIn login={this.updateUser} />;
        } else {
            const u = this.state.authenticated as User;
            const theme = createMuiTheme({palette: {primary: colorList[u.color], type: u.theme}});
            return (
                <MuiThemeProvider theme={theme}>
                    <Layout
                        setColor={this.setColor}
                        setTheme={this.setTheme}
                        logout={() => this.setState({authenticated: false})}
                        {...u}
                    />
                </MuiThemeProvider>
            );
        }
    }

    setColor = (color: number) =>
        this.setState({authenticated: {...(this.state.authenticated as User), color}});

    setTheme = (theme: 'light' | 'dark') =>
        this.setState({authenticated: {...(this.state.authenticated as User), theme}});

    updateUser = (username: string, result: Http.GetUserInfo) => {
        this.setState({
            authenticated: {...result, username, theme: result.theme ? 'dark' : 'light'},
        });
    };
}

export default connect()(App);
