import React, {Component} from 'react';
import {
    createMuiTheme,
    MuiThemeProvider,
    Button,
    Card,
    TextField,
    Checkbox,
    Typography,
} from '@material-ui/core';
import * as Http from '../Http';
import Logo from '../SharedComponents/Logo';
import {green} from '@material-ui/core/colors';
import AVOModal from '../SharedComponents/MaterialModal';
import {agreement} from './Agreement';

interface PasswordResetProps {
    token: string;
    showTerms: boolean;
}

interface PasswordResetState {
    newPassword: string;
    confirmPassword: string;
    hasAgreedToTOS: boolean;
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
            hasAgreedToTOS: false,
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
                            {this.props.showTerms && <>
                                <br/>
                                <Typography variant='caption'>
                                    <Checkbox
                                        color='primary'
                                        checked={this.state.hasAgreedToTOS}
                                        onClick={() =>
                                            this.setState({
                                                hasAgreedToTOS: !this.state.hasAgreedToTOS,
                                            })
                                        }
                                    />
                                    I agree to the Terms of Service found <a id='ToC-here'>here</a>.
                                    <br />
                                </Typography>
                            </>}
                            <br />
                            <br />
                            <Typography variant='caption' color='error'>
                                {errorMessage}
                            </Typography>
                            <br />
                            <Button
                                style={{float: 'right'}}
                                color='primary'
                                disabled={!longEnough || !passwordsMatch || (this.props.showTerms && !this.state.hasAgreedToTOS)}
                                onClick={this.sendChangeRequest}
                            >
                                Submit New Password
                            </Button>
                        </form>
                    </Card>
                    <AVOModal
                        title='Terms of Service'
                        target='ToC-here'
                        acceptText='I Agree'
                        declineText='Decline'
                        onAccept={() => {
                            this.setState({hasAgreedToTOS: true});
                        }}
                        onDecline={() => {
                            this.setState({hasAgreedToTOS: false});
                        }}
                    >
                        {agreement}
                    </AVOModal>
                </div>
            </MuiThemeProvider>
        );
    }

    sendChangeRequest = () => {
        Http.resetPassword(
            this.props.token,
            this.state.newPassword,
            () => {
                alert(
                    'Password successfully changed! You will now be redirected to the login page.',
                );
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
