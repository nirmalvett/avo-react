import React from 'react';
import Http from './Http';
import Card from '@material-ui/core/Card/Card';
import Grid from '@material-ui/core/Grid/Grid';
import Button from '@material-ui/core/Button/Button';
import TextField from '@material-ui/core/TextField/TextField';
import Typography from '@material-ui/core/Typography/Typography';
import Logo from "./Logo";
import {red, pink, purple, deepPurple, indigo, blue, lightBlue, cyan, teal, green, lightGreen, amber, orange,
    deepOrange, brown, grey, blueGrey} from '@material-ui/core/colors';
import {createMuiTheme, MuiThemeProvider} from "@material-ui/core";

export default class PasswordResetPage extends React.Component {

    constructor(props = {}) {
        super(props);
        this.state = {
            canSubmitPassword : false,
            errorMessage      : '',
        }
    };

    render() {
        return (
          <MuiThemeProvider theme={createMuiTheme({palette: {primary: green}})}>
             <div style={{width: '100%', flex: 1, display: 'flex'}}>
                <Grid container spacing={8} style={{flex: 1, display: 'flex', paddingBottom: 0}}>
                    <Grid item xs={4}/>
                    <Grid item xs={4} style={{display: 'flex'}}>
                        <Card classes={{root: 'avo-card'}}>
                            <Logo/>
                            <Typography variant='headline'>
                                Change Password
                            </Typography>
                            <form noValidate autoComplete='off'>
                                <TextField
                                    id='avo-passreset__new-password'
                                    margin='normal'
                                    color='primary'
                                    label='New Password'
                                    type='password'
                                    onChange={() => this.comparePasswordsForValidation()}
                                />
                                <br/>
                                <TextField
                                    id='avo-passreset__confirm-password'
                                    margin='normal'
                                    color='primary'
                                    label='Confirm Password'
                                    type='password'
                                    onChange={() => this.comparePasswordsForValidation()}
                                />
                                <br/>
                                <br/>
                                <Typography variant='caption' className='avo-styles__error'>
                                    {this.state.errorMessage}
                                </Typography>
                                <br/>
                                <Button
                                    style = {{float: 'right'}}
                                    id='avo-signin__button'
                                    color= 'primary'
                                    disabled={!this.state.canSubmitPassword}
                                    onClick={() => this.sendChangeRequest()}
                                >
                                    Submit New Password
                                </Button>
                            </form>
                        </Card>
                    </Grid>
                    <Grid item xs={1}/>
                </Grid>
            </div>
          </MuiThemeProvider>
        );
    };

    comparePasswordsForValidation() {
        const newPassword = document.getElementById('avo-passreset__new-password').value;
        const conPassword = document.getElementById('avo-passreset__confirm-password').value;
        let match = (newPassword === conPassword) && newPassword.length >= 8;
        if(!match) {
            this.setState({ errorMessage : 'Passwords do not match!' });
        }else if(newPassword.length < 8){
            this.setState({ errorMessage : 'Passwords must be 8 characters in length or greater!' });
        }else{
            this.setState({ errorMessage : '' });
        }
        this.setState({ canSubmitPassword : match });
    };

    sendChangeRequest() {
        let starting_index = window.location.href.indexOf('passwordReset') + ('passwordReset').length + 1;
        const token = window.location.href.substring(starting_index);
        const newPassword = document.getElementById('avo-passreset__confirm-password').value;
        const plainAVOUrl = window.location.href.split("passwordReset")[0]; // i.e. app.avocadocore.com/
        Http.submitPasswordChange(
            token,
            newPassword,
            () => {
                alert('Password successfully changed!');
                window.history.pushState("backToLogin", "AvocadoCore", plainAVOUrl);
                window.location.reload();
            },
            (e) => {
                alert("An error occurred when making the request please try again in 5-10 minutes.");
            }
        );
    };

};
