import React, {Component} from 'react';
import Http from '../HelperFunctions/Http';
import Card from '@material-ui/core/Card/Card';
import Grid from '@material-ui/core/Grid/Grid';
import Button from '@material-ui/core/Button/Button';
import TextField from '@material-ui/core/TextField/TextField';
import Typography from '@material-ui/core/Typography/Typography';
import Logo from '../SharedComponents/Logo';
import {green} from '@material-ui/core/colors';
import {createMuiTheme, MuiThemeProvider} from '@material-ui/core';

interface PasswordResetProps {}

interface PasswordResetState {
    canSubmitPassword: boolean;
    errorMessage: string;
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
            canSubmitPassword: false,
            errorMessage: '',
            newPassword: '',
            confirmPassword: '',
        };
    }

    updateNewPassword = (e: Event) => this.setState({newPassword: e.target.value});

    updateConfirmPassword = (e: Event) => this.setState({confirmPassword: e.target.value});

    render() {
        const {newPassword, confirmPassword} = this.state;
        const canSubmitPassword = newPassword === confirmPassword && newPassword.length >= 8;
        const errorMessage = !canSubmitPassword
            ? 'Passwords do not match!'
            : newPassword.length < 8
            ? 'Passwords must be 8 characters in length or greater!'
            : '';
        return (
            <MuiThemeProvider theme={createMuiTheme({palette: {primary: green}})}>
                <div style={{width: '100%', flex: 1, display: 'flex'}}>
                    <Grid
                        container
                        spacing={8}
                        style={{flex: 1, display: 'flex', paddingBottom: 0}}
                    >
                        <Grid item xs={4} />
                        <Grid item xs={4} style={{display: 'flex'}}>
                            <Card classes={{root: 'avo-card'}}>
                                <Logo />
                                <Typography variant='h5'>Change Password</Typography>
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
                                    <Typography variant='caption' className='avo-styles__error'>
                                        {errorMessage}
                                    </Typography>
                                    <br />
                                    <Button
                                        style={{float: 'right'}}
                                        id='avo-signin__button'
                                        color='primary'
                                        disabled={!this.state.canSubmitPassword}
                                        onClick={() => this.sendChangeRequest()}
                                    >
                                        Submit New Password
                                    </Button>
                                </form>
                            </Card>
                        </Grid>
                        <Grid item xs={1} />
                    </Grid>
                </div>
            </MuiThemeProvider>
        );
    }

    sendChangeRequest() {
        let starting_index =
            window.location.href.indexOf('passwordReset') + 'passwordReset'.length + 1;
        const token = window.location.href.substring(starting_index);
        const plainAvoUrl = window.location.href.split('passwordReset')[0]; // i.e. app.avocadocore.com/
        Http.submitPasswordChange(
            token,
            this.state.newPassword,
            () => {
                alert('Password successfully changed!');
                window.history.pushState('backToLogin', 'AvocadoCore', plainAvoUrl);
                window.location.reload();
            },
            () => {
                alert(
                    'An error occurred when making the request please try again in 5-10 minutes.',
                );
            },
        );
    }
}
