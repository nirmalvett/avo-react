import React from 'react';
import './App.css';

import TextField from "@material-ui/core/TextField/TextField";
import Card from "@material-ui/core/Card/Card";
import Typography from "@material-ui/core/Typography/Typography";
import Button from "@material-ui/core/Button/Button";
import Grid from "@material-ui/core/Grid/Grid";

class SignIn extends React.Component {
	state = {
		firstName: '',
		lastName: '',
		email: '',
		password1: '',
		password2: ''
	};

	render() {
		return (
			<Card className='LoginCard'>
				<Grid container spacing={24} style={{'margin': '5%', 'width': '90%', 'height': '90%'}}>
					<Grid item xs={6}>
						<Typography variant="headline">Register</Typography>
						<form style={{'width': '100%'}} noValidate autoComplete="off">
							<TextField margin="normal" style={{'width': '100%'}} id="firstName" label="First Name"/>
							<br/>
							<TextField margin="normal" style={{'width': '100%'}} id="lastName" label="Last Name"/>
							<br/>
							<TextField margin="normal" style={{'width': '100%'}} id="email" label="UWO Email"
							           onChange={(e) => this.setState({'email': e.target.value})} value={this.state.email}
							           error={this.state.email.length > 0 && !/^[a-zA-Z]{2,}\d*@uwo\.ca$/.test(this.state.email)}/>
							<br/>
							<TextField margin="normal" style={{'width': '100%'}} id="password1" label="Password (minimum 8 characters)"
							           type="password" helperText="" onfocusout={() => console.log('abc')}
							           onChange={(e) => this.setState({'password1': e.target.value})} value={this.state.password1}
							           error={this.state.password1.length > 0 && this.state.password1.length < 8}/>
							<br/>
							<TextField margin="normal" style={{'width': '100%'}} id="password2" label="Re-Enter Password" type="password"
							           onChange={(e) => this.setState({'password2': e.target.value})} value={this.state.password2}
							           error={this.state.password2.length > 0 && this.state.password2 !== this.state.password1}/>
							<br/><br/>
							<Button color="primary" onClick={() => this.register()}>Register</Button>
						</form>
					</Grid>
					<Grid item xs={6}>
						<p>abc</p>
					</Grid>
				</Grid>
			</Card>
		);
	}

	register() {
		console.log(this.state);
	}
}

export default SignIn;
