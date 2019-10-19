import React, {Component} from 'react';
import {
    createMuiTheme,
    MuiThemeProvider,
    Button,
    Card,
    TextField,
    Typography,
} from '@material-ui/core';
import * as Http from '../Http';
import Logo from '../SharedComponents/Logo';
import {green} from '@material-ui/core/colors';

interface PasswordResetProps {
    token: string;
}

interface PasswordResetState {
    newPassword: string;
    confirmPassword: string;
}

interface Event {
    target: {
        value: string;
    };
}

export default class PasswordResetPage extends Component<PasswordResetProps, PasswordResetState> {
    constructor(props: PasswordResetProps) {
        super(props);
        this.state = {
            newPassword: '',
            confirmPassword: '',
        };
    }

    updateNewPassword = (e: Event) => this.setState({newPassword: e.target.value});

    updateConfirmPassword = (e: Event) => this.setState({confirmPassword: e.target.value});

    render() {
        const {newPassword, confirmPassword} = this.state;
        const passwordsMatch = newPassword === confirmPassword;
        const longEnough = newPassword.length >= 8;
        const errorMessage =
            newPassword.length === 0
                ? ''
                : !longEnough
                ? 'Passwords must be at least 8 characters long!'
                : !passwordsMatch
                ? 'Passwords do not match!'
                : '';
        return (
            <MuiThemeProvider theme={createMuiTheme({palette: {primary: green}})}>
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Card classes={{root: 'avo-card'}} style={{width: '40ch', maxWidth: '90%'}}>
                        <Logo theme='light' />
                        {this.props.children}
                        <form noValidate autoComplete='off'>
                            <TextField
                                id='avo-passreset__new-password'
                                margin='normal'
                                color='primary'
                                label='New Password'
                                type='password'
                                onChange={this.updateNewPassword}
                            />
                            <br />
                            <TextField
                                id='avo-passreset__confirm-password'
                                margin='normal'
                                color='primary'
                                label='Confirm Password'
                                type='password'
                                onChange={this.updateConfirmPassword}
                            />
                            <br />
                            <br />
                            <Typography variant='caption' color='error'>
                                {errorMessage}
                            </Typography>
                            <br />
                            <Button
                                style={{float: 'right'}}
                                color='primary'
                                disabled={!longEnough || !passwordsMatch}
                                onClick={this.sendChangeRequest}
                            >
                                Submit New Password
                            </Button>
                        </form>
                    </Card>
                </div>
            </MuiThemeProvider>
        );
    }

    sendChangeRequest = () => {
        Http.resetPassword(
            this.props.token,
            this.state.newPassword,
            () => {
                alert('Password successfully changed! You will now be redirected to the login page.');
                window.history.pushState('backToLogin', 'AvocadoCore', window.location.origin);
                window.location.reload();
            },
            () => {
                alert(
                    'An error occurred when making the request please try again in 5-10 minutes.',
                );
            },
        );
    };
}
