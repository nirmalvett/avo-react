import React, {Component, Fragment} from 'react';
import {
    createMuiTheme,
    Button,
    Card,
    Checkbox,
    Slide,
    TextField,
    Typography,
} from '@material-ui/core';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import * as Http from '../Http';
import Logo from '../SharedComponents/Logo';
import AVOModal from '../SharedComponents/MaterialModal';
import {agreement} from './Agreement';

interface Event {
    target: {
        value: string;
    };
}
const EMAIL_LINK = 'mailto:contact@avocadocore.com?Subject=Help%20I%20am%20having%20trouble';
const style = {width: '100%'};
const theme = createMuiTheme({
    palette: {primary: {'200': '#f8ee7b', '500': '#399103'}, type: 'light'},
});

interface SignInProps {
    login: (result: Http.GetUserInfo) => void;
}

interface SignInState {
    isSigningIn: boolean;
    rFirstName: string;
    rLastName: string;
    rEmail: string;
    rPassword1: string;
    rPassword2: string;
    username: string;
    password: string;
    signInError: string;
    hasAgreedToTOS: boolean;
    messageToUser?: string;
    resetEmail: string;
}

export default class SignIn extends Component<SignInProps, SignInState> {
    constructor(props: SignInProps) {
        super(props);
        this.state = {
            isSigningIn: true,
            rFirstName: '',
            rLastName: '',
            rEmail: '',
            rPassword1: '',
            rPassword2: '',
            username: '',
            password: '',
            signInError: '',
            hasAgreedToTOS: false,
            resetEmail: '',
        };
    }

    componentDidMount() {
        if (window.location.href.includes('/confirm/')) {
            alert(
                'Your account was successfully confirmed! You may now log in and begin using AVO.',
            );
        }
        const checkQuertString = (name: string) => {
            var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
            return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
        };


        if (checkQuertString('expiredPasswordReset')) {
            const label = document.getElementById('avo-signin__reset-password');
            if (label)
                label.click()
        }
    }

    updateFirstName = (e: Event) => this.setState({rFirstName: e.target.value});

    updateLastName = (e: Event) => this.setState({rLastName: e.target.value});

    updateEmail = (e: Event) => this.setState({rEmail: e.target.value.toLowerCase()});

    updatePassword1 = (e: Event) => this.setState({rPassword1: e.target.value});

    updatePassword2 = (e: Event) => this.setState({rPassword2: e.target.value});

    updateUsername = (e: Event) => this.setState({username: e.target.value});

    updatePassword = (e: Event) => this.setState({password: e.target.value});

    updateResetEmail = (e: Event) => this.setState({resetEmail: e.target.value});

    render() {
        const s = this.state;
        return (
            <MuiThemeProvider theme={theme}>
                <Slide in={true} direction={'up'}>
                    <Card className='LoginCard' id='avo-registrator'>
                        <div style={{margin: '5%', width: '100%', height: '90%'}}>
                            {s.isSigningIn ? this.renderSignIn() : this.renderRegister()}
                            <footer className='avo-styles__footer'>
                                <Typography variant='caption'>
                                    {s.isSigningIn
                                        ? "Don't have an account? Click "
                                        : 'Already have an Account? Click '}
                                    <a
                                        id='switchRegistration'
                                        className='avo-styles__link'
                                        onClick={() => this.setState({isSigningIn: !s.isSigningIn})}
                                    >
                                        here
                                    </a>
                                    {'.'}
                                </Typography>
                                {this.passwordReset()}
                                <br/>
                                <Typography variant='caption'>
                                    If you are having any difficulties, please email us at <a className='avo-styles__link' href={EMAIL_LINK}>contact@avocadocore.com</a>
                                </Typography>
                            </footer>
                        </div>
                    </Card>
                </Slide>
            </MuiThemeProvider>
        );
    }

    renderSignIn() {
        const s = this.state;
        let usernameError = s.username.length > 0 && !/^[a-zA-Z]{2,}\d*@uwo\.ca$/.test(s.username);
        let passwordError = s.password.length > 0 && s.password.length < 8;
        return (
            <Fragment>
                <Logo theme='light'/>
                <Typography variant='h5'>Sign In</Typography>
                <form style={style} noValidate autoComplete='off'>
                    <TextField
                        margin='normal'
                        style={style}
                        label='Email'
                        onChange={this.updateUsername}
                        value={s.username}
                        error={usernameError}
                    />
                    <br/>
                    <TextField
                        margin='normal'
                        style={style}
                        label='Password'
                        type='password'
                        onChange={this.updatePassword}
                        value={s.password}
                        error={passwordError}
                    />
                    <br/>
                    <Typography variant='caption' color='error'>
                        {s.signInError}
                    </Typography>
                    <br/>
                    <Button
                        color='primary'
                        className='avo-button avo-styles__float-right'
                        onClick={() => this.signIn()}
                    >
                        Sign In
                    </Button>
                </form>
                <br/>
                <br/>
            </Fragment>
        );
    }

    renderRegister() {
        const s = this.state;
        const emailError = s.rEmail.length > 0 && !/^[a-zA-Z]{2,}\d*@uwo\.ca$/.test(s.rEmail);
        const rPw1Error = s.rPassword1.length > 0 && s.rPassword1.length < 8;
        const rPw2Error = s.rPassword2.length > 0 && s.rPassword2 !== s.rPassword1;
        return (
            <Fragment>
                <Typography variant='h5'>Register</Typography>
                <form style={{width: '100%'}}>
                    <TextField
                        margin='normal'
                        style={style}
                        label='First Name'
                        onChange={this.updateFirstName}
                        value={s.rFirstName}
                    />
                    <br/>
                    <TextField
                        margin='normal'
                        style={style}
                        label='Last Name'
                        onChange={this.updateLastName}
                        value={s.rLastName}
                    />
                    <br/>
                    <TextField
                        margin='normal'
                        style={style}
                        label='UWO Email'
                        onChange={this.updateEmail}
                        value={s.rEmail}
                        error={emailError}
                    />
                    <br/>
                    <TextField
                        margin='normal'
                        style={style}
                        label='Password'
                        type='password'
                        onChange={this.updatePassword1}
                        value={s.rPassword1}
                        error={rPw1Error}
                        helperText='(Minimum 8 characters)'
                    />
                    <br/>
                    <TextField
                        margin='normal'
                        style={style}
                        label='Re-Enter Password'
                        type='password'
                        onChange={this.updatePassword2}
                        value={s.rPassword2}
                        error={rPw2Error}
                    />
                    <br/>
                    <Typography variant='caption'>
                        <Checkbox
                            color='primary'
                            checked={s.hasAgreedToTOS}
                            onClick={() =>
                                this.setState({
                                    hasAgreedToTOS: !s.hasAgreedToTOS,
                                })
                            }
                        />
                        I agree to the Terms of Service found <a id='ToC-here'>here</a>.
                        <br/>
                        <Typography color='error'>{s.messageToUser}</Typography>
                    </Typography>
                    <Button
                        color='primary'
                        classes={{
                            root: 'avo-button',
                            disabled: 'disabled',
                        }}
                        className='avo-styles__float-right'
                        disabled={!s.hasAgreedToTOS}
                        onClick={() => this.register()}
                    >
                        Register
                    </Button>
                </form>
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
                <br/>
            </Fragment>
        );
    }

    passwordReset() {
        const s = this.state;
        return (
            s.isSigningIn && (
                <Fragment>
                    <br/>
                    <Typography variant='caption' id='avo-signin__reset-password'>
                        Forgot your password/Want to change your password? Click{' '}
                        <a className='avo-styles__link'> here </a>
                    </Typography>
                    <AVOModal
                        title='Reset Password?'
                        target='avo-signin__reset-password'
                        acceptText='Reset'
                        declineText='Never mind'
                        onAccept={() => {
                            if (s.resetEmail !== '') {
                                Http.requestPasswordReset(
                                    s.resetEmail,
                                    () =>
                                        alert(
                                            'An email has been sent with a reset link, ' +
                                            'please check your inbox.',
                                        ),
                                    e => alert(e.error),
                                );
                            }
                        }}
                        onDecline={() => {
                        }}
                    >
                        <Typography variant='caption'>
                            Enter the email associated to the account and we'll send you a link to
                            reset the password.
                        </Typography>
                        <TextField
                            margin='normal'
                            style={{width: '50%'}}
                            label='Email'
                            type='email'
                            id='avo-signin__reset-email'
                            value={s.resetEmail}
                            onChange={this.updateResetEmail}
                        />
                        <br/>
                    </AVOModal>
                </Fragment>
            )
        );
    }

    // noinspection JSMethodCanBeStatic
    register() {
        this.setState({messageToUser: 'Loading...'});
        const s = this.state;
        if (this.checkInputFields()) {
            Http.register(
                s.rFirstName,
                s.rLastName,
                s.rEmail,
                s.rPassword1,
                ({message}) =>
                    this.setState({
                        rFirstName: '',
                        rLastName: '',
                        rEmail: '',
                        rPassword1: '',
                        rPassword2: '',
                        username: s.rEmail,
                        password: s.rPassword1,
                        hasAgreedToTOS: false,
                        messageToUser:
                            message === 'email sent'
                                ? 'Registration successful!'
                                : 'Registration successful! Your account was already confirmed by' +
                                " your professor, you're all set to sign in and start using AVO.",
                    }, ()=>setTimeout(() => this.setState({isSigningIn: true}), 500)),
                result => this.setState({messageToUser: result.error}),
            );
        }
    }

    checkInputFields() {
        const s = this.state;

        const isValid =
            // /^[a-zA-Z]{2,}\d*@uwo\.ca$/.test(s.rEmail) &&
            s.rPassword1.length >= 8 &&
            s.rPassword2 === s.rPassword1;
        if (isValid && s.hasAgreedToTOS) return true;
        else if (!isValid)
            this.setState({messageToUser: 'Please check you email and password fields again.'});
        else if (!s.hasAgreedToTOS)
            this.setState({
                messageToUser:
                    'Please click on Terms and Conditions and agree to it before registering',
            });
    }

    // noinspection JSMethodCanBeStatic
    signIn() {
        Http.login(
            this.state.username,
            this.state.password,
            result => {
                this.props.login(result)
                Http.collectData('login', {}, ()=>{}, console.warn)
            },
            result => this.setState({signInError: result}),
        );
    }
}
