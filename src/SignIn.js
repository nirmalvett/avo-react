import React from 'react';
import './App.css';

import TextField from "@material-ui/core/TextField/TextField";
import Card from "@material-ui/core/Card/Card";
import Typography from "@material-ui/core/Typography/Typography";
import Button from "@material-ui/core/Button/Button";
import Grid from "@material-ui/core/Grid/Grid";
import logo from "./Avocado_logo_light.svg"

class SignIn extends React.Component {
    state = {
        registerFirstName: '',
        registerLastName: '',
        registerEmail: '',
        registerPassword1: '',
        registerPassword2: '',
        loginEmail: '',
        loginPassword: '',
    };

    render() {
        let style = {'width': '100%'};
        return (
            <Card className='LoginCard'>
                <Grid container spacing={24} style={{'margin': '5%', 'width': '90%', 'height': '90%'}}>
                    <Grid item xs={6}>
                        <Typography variant="headline">Register</Typography>
                        <form style={{'width': '100%'}} noValidate autoComplete="off">
                            <TextField margin="normal" style={style} id="registerFirstName" label="First Name"/>
                            <br/>
                            <TextField margin="normal" style={style} id="registerLastName" label="Last Name"/>
                            <br/>
                            <TextField margin="normal" style={style} id="registerEmail" label="UWO Email"
                                       onChange={(e) => this.setState({registerEmail: e.target.value})}
                                       value={this.state.registerEmail}
                                       error={this.state.registerEmail.length > 0 && !/^[a-zA-Z]{2,}\d*@uwo\.ca$/.test(this.state.registerEmail)}/>
                            <br/>
                            <TextField margin="normal" style={style} id="registerPassword1" label="Password"
                                       type="password" helperText="(Minimum 8 characters)"
                                       onChange={(e) => this.setState({registerPassword1: e.target.value})}
                                       value={this.state.registerPassword1}
                                       error={this.state.registerPassword1.length > 0 && this.state.registerPassword1.length < 8}/>
                            <br/>
                            <TextField margin="normal" style={style} id="registerPassword2" label="Re-Enter Password"
                                       type="password" value={this.state.registerPassword2}
                                       onChange={(e) => this.setState({registerPassword2: e.target.value})}
                                       error={this.state.registerPassword2.length > 0 && this.state.registerPassword2 !== this.state.registerPassword1}/>
                            <br/><br/>
                            <Button color="primary" onClick={() => this.register()}>Register</Button>
                        </form>
                    </Grid>
                    <Grid item xs={6}>
                        <img src={logo}/>
                        <Typography variant="headline">Sign In</Typography>
                        <form style={style} noValidate autoComplete="off">
                            <TextField margin="normal" style={style} id="email" label="Email"
                                       onChange={(e) => this.setState({loginEmail: e.target.value})}
                                       value={this.state.loginEmail}
                                       error={this.state.loginEmail.length > 0 && !/^[a-zA-Z]{2,}\d*@uwo\.ca$/.test(this.state.loginEmail)}/>
                            <br/>
                            <TextField margin="normal" style={style} id="loginPassword" label="Password" type="password"
                                       onChange={(e) => this.setState({loginPassword: e.target.value})}
                                       value={this.state.loginPassword}
                                       error={this.state.loginPassword.length > 0 && this.state.loginPassword.length < 8}/>
                            <br/><br/>
                            <Button color="primary" onClick={() => this.forgotPassword()}>Forgot Password</Button>
                            <Button color="primary" onClick={() => this.signIn()}>Sign In</Button>
                        </form>
                    </Grid>
                </Grid>
            </Card>
        );
    }

    // noinspection JSMethodCanBeStatic
    register() {
        alert("Todo"); // Todo
    }

    // noinspection JSMethodCanBeStatic
    forgotPassword() {
        alert("Todo"); // Todo
    }

    // noinspection JSMethodCanBeStatic
    signIn() {
        alert("Todo"); // Todo
    }
}

export default SignIn;
