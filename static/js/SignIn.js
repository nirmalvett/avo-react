import React from 'react';

import Button from '@material-ui/core/Button/Button';
import Card from '@material-ui/core/Card/Card';
import Grid from '@material-ui/core/Grid/Grid';
import TextField from '@material-ui/core/TextField/TextField';
import Typography from '@material-ui/core/Typography/Typography';
import Logo from './Logo';
import AvoHttp from "./Http";

export default class SignIn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rFirstName: '',
            rLastName: '',
            rEmail: '',
            rPassword1: '',
            rPassword2: '',
            username: '',
            password: '',
        };
    }

    render() {
        let style = {'width': '100%'};

        let updateFirstName = (e) => this.setState({rFirstName: e.target.value});
        let updateLastName = (e) => this.setState({rLastName: e.target.value});
        let updateEmail = (e) => this.setState({rEmail: e.target.value.toLowerCase()});
        let updatePassword1 = (e) => this.setState({rPassword1: e.target.value});
        let updatePassword2 = (e) => this.setState({rPassword2: e.target.value});

        let updateUsername = (e) => this.setState({username: e.target.value});
        let updatePassword = (e) => this.setState({password: e.target.value});

        let emailError = this.state.rEmail.length > 0 && !/^[a-zA-Z]{2,}\d*@uwo\.ca$/.test(this.state.rEmail);
        let rPw1Error = this.state.rPassword1.length > 0 && this.state.rPassword1.length < 8;
        let rPw2Error = this.state.rPassword2.length > 0 && this.state.rPassword2 !== this.state.rPassword1;

        let usernameError = this.state.username.length > 0 && !/^[a-zA-Z]{2,}\d*@uwo\.ca$/.test(this.state.username);
        let passwordError = this.state.password.length > 0 && this.state.password.length < 8;

        return (
            <Card className='LoginCard'>
                <Grid container spacing={24} style={{'margin': '5%', 'width': '90%', 'height': '90%'}}>
                    <Grid item xs={6}>
                        <Typography variant='headline'>Register</Typography>
                        <form style={{'width': '100%'}}>
                            <TextField margin='normal' style={style} label='First Name' onChange={updateFirstName}/>
                            <br/>
                            <TextField margin='normal' style={style} label='Last Name' onChange={updateLastName}/>
                            <br/>
                            <TextField margin='normal' style={style} label='UWO Email' onChange={updateEmail}
                                       error={emailError}/>
                            <br/>
                            <TextField margin='normal' style={style} label='Password' type='password'
                                       onChange={updatePassword1} value={this.state.rPassword1} error={rPw1Error}
                                       helperText='(Minimum 8 characters)'/>
                            <br/>
                            <TextField margin='normal' style={style} label='Re-Enter Password' type='password'
                                       onChange={updatePassword2} value={this.state.rPassword2} error={rPw2Error}/>
                            <br/>
                            <br/>
                            <Button color='primary' onClick={() => this.register()}>Register</Button>
                        </form>
                    </Grid>
                    <Grid item xs={6}>
                        <Logo theme='light'/>
                        <Typography variant='headline'>Sign In</Typography>
                        <form style={style} noValidate autoComplete='off'>
                            <TextField margin='normal' style={style} label='Email'
                                       onChange={updateUsername} value={this.state.username} error={usernameError}/>
                            <br/>
                            <TextField margin='normal' style={style} label='Password' type='password'
                                       onChange={updatePassword} value={this.state.password} error={passwordError}/>
                            <br/>
                            <br/>
                            <Button color='primary' onClick={() => this.forgotPassword()}>Forgot Password</Button>
                            <Button color='primary' onClick={() => this.signIn()}>Sign In</Button>
                        </form>
                    </Grid>
                </Grid>
            </Card>
        );
    }

    // noinspection JSMethodCanBeStatic
    register() {
        let s = this.state;
        if (/^[a-zA-Z]{2,}\d*@uwo\.ca$/.test(s.rEmail) && s.rPassword1.length >= 8 && s.rPassword2 === s.rPassword1) {
            AvoHttp.register(s.rFirstName, s.rLastName, s.rEmail, s.rPassword1,
                () => {this.setState({rFirstName: '', rLastName: '', rEmail: '', rPassword1: '', rPassword2: '',
                    username: s.rEmail, password: s.rPassword1})},
                (result) => {
                    alert(result.error);
                }
            );
        }
    }

    // noinspection JSMethodCanBeStatic
    forgotPassword() {
        alert('Coming Soon!'); // Todo
    }

    // noinspection JSMethodCanBeStatic
    signIn() {
        AvoHttp.login(this.state.username, this.state.password, () => {
            this.props.login();
            }, (result) => {
            alert(result.error)
            }
        );
    }
}