import React, { Component } from 'react';
import {Button, Card, Grid, Grow, Typography} from '@material-ui/core';
import Logo from '../SharedComponents/Logo';
import MultipleChoiceBuilder from './MultipleChoiceBuilder';
import QuestionManager from '../CourseBuilder/QuestionBuilder/QuestionManager';

export default class QuestionBuilderHome extends Component {

	constructor(props) {
		super(props);
		this.state = {
			mode     : 'home',
			isActive : false
		};
	};

	render() {
		switch(this.state.mode) {
			case 'home':
				return this.renderHomeScreen();
			case 'math' : 
				return ( 
					<QuestionManager
						showSnackBar={this.props.showSnackBar}
			            theme={this.props.theme}
			            initManager={this.props.initManager}
			            initWith={this.props.initWith}
					/> 
				);
			case 'multiple-choice': 
				return ( 
					<MultipleChoiceBuilder
						showSnackBar={this.props.showSnackBar}
			            theme={this.props.theme}
			            initManager={this.props.initManager}
						initWith={this.props.initWith}
						return={() => this.setState({mode: 'home', isActive: true})}
					/>
				);
			default:
				return this.renderHomeScreen();
		};
	};

	renderHomeScreen() {
		return (
			<Grid container xs={12}>
				<Grid item xs={3}>
				</Grid>
				<Grid item xs={6}>
				 	<Grow in={this.state.isActive}>
						<Card
							className="avo-card"
							style={{
								height : 'auto',
								width  : 'auto',
								maxHeight : '100%'
							}}
						>
							<Logo
		                        theme={this.props.theme}
		                        style={{width: '80%', marginLeft: '10%', marginTop: '5%'}}
		                    />
		                    <Typography variant="h4" gutterBottom>
						 		Question Builder
						    </Typography>
						    <Typography variant="subtitle1" gutterBottom>
						 		What type of question would you like to create today?
						    </Typography>
						    <br/>
							<Button
								onClick={this.switchToMathQB.bind(this)}
								variant="outlined"
								color="primary"
								className=''
								style={{ width : '90%', borderRadius : '2.5em', margin : '5%', marginBottom : '0px' }}
							>
					        	Math
					      	</Button>
					      	<br/>
					      	<Button
					      		onClick={this.switchToMCB.bind(this)}
					      		variant="outlined"
					      		color="primary"
					      		className=''
					      		style={{ width : '90%', borderRadius : '2.5em', margin : '5%', marginBottom : '0px' }}
					      	>
					        	Multiple choice
					      	</Button>
					      	<br/>
					      	<Button
					      		variant="outlined"
					      		color="primary"
					      		className=''
					      		style={{ width : '90%', borderRadius : '2.5em', margin : '5%' }}
					      	>
					        	True or False
					      	</Button>
						</Card>
					</Grow>
				</Grid>
				<Grid item xs={3}>
				</Grid>
			</Grid>
		);
	};

	componentDidMount() {
		this.setState({ isActive : true });
	};

	switchToMathQB() {
		this.setState({ isActive : false });
		setTimeout(() => {
			this.setState({ mode : 'math' });
		}, 500);
	};

	switchToMCB() {
		this.setState({ isActive : false });
		setTimeout(() => {
			this.setState({ mode : 'multiple-choice' });
		}, 500);
	};
};
