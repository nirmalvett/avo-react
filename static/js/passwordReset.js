import React from 'react';
import Http from './Http';
import Card from '@material-ui/core/Card/Card';
import Grid from '@material-ui/core/Grid/Grid';
import Button from '@material-ui/core/Button/Button';
import TextField from '@material-ui/core/TextField/TextField';
import Typography from '@material-ui/core/Typography/Typography';
import Logo from "./Logo";

export default class PasswordResetPage extends React.Component {

    constructor(props = {}) {
        super(props);
        this.state = {
            canSubmitPassword : false,
            errorMessage      : '',
        }
    };

    render() {
        console.log(this.state.canSubmitPassword);
        return (
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
                                    label='New Password'
                                    type='password'
                                    onChange={() => this.comparePasswordsForValidation()}
                                />
                                <br/>
                                <TextField
                                    id='avo-passreset__confirm-password'
                                    margin='normal'
                                    label='Confirm Password'
                                    type='password'
                                    onChange={() => this.comparePasswordsForValidation()}
                                />
                                <br/>
                                <Typography variant='caption' className='avo-styles__error'>
                                    {this.state.errorMessage}
                                </Typography>
                                <br/>
                                <Button
                                    id='avo-signin__button'
                                    color='primary'
                                    disabled={!this.state.canSubmitPassword}
                                    className="avo-button avo-styles__float-right"
                                    onClick={() => this.sendChangeRequest()}>
                                    Submit New Password
                                </Button>
                            </form>
                        </Card>
                    </Grid>
                    <Grid item xs={1}/>
                </Grid>
            </div>
        );
    };

    comparePasswordsForValidation() {
        const newPassword = document.getElementById('avo-passreset__new-password').value;
        const conPassword = document.getElementById('avo-passreset__confirm-password').value;
        let match = (newPassword == conPassword) && newPassword.length >= 8;
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
        let starting_index;
        const token = '';
        const newPassword = document.getElementById('avo-passreset__confirm-password').value;
    };

};