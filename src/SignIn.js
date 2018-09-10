import React from 'react';
import './App.css';

import TextField from "@material-ui/core/TextField/TextField";
import Card from "@material-ui/core/Card/Card";
import Typography from "@material-ui/core/Typography/Typography";
import Button from "@material-ui/core/Button/Button";
import Grid from "@material-ui/core/Grid/Grid";

class SignIn extends React.Component {

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
							<TextField margin="normal" style={{'width': '100%'}} id="email" label="Email"/>
							<br/>
							<TextField margin="normal" style={{'width': '100%'}} id="password1" label="Password" type="password"/>
							<br/>
							<TextField margin="normal" style={{'width': '100%'}} id="password2" label="Re-Enter Password" type="password"/>
							<br/><br/>
							<Button color="primary">Register</Button>
						</form>
					</Grid>
					<Grid item xs={6}>
						<p>abc</p>
					</Grid>
				</Grid>
			</Card>
		);
	}
}

export default SignIn;
