import React, { Component } from 'react';
import {Button, Card, Grid, Grow, Typography} from '@material-ui/core';
import Logo from '../SharedComponents/Logo';
import MultipleChoiceBuilder from './MultipleChoiceBuilder';
import QuestionManager, {QuestionManagerProps} from '../CourseBuilder/QuestionBuilder/QuestionManager';

interface QuestionBuilderHomeState {
	mode: 'home' | 'math' | 'multiple-choice';
	isActive: boolean;
}

type QuestionBuilderHomeProps = QuestionManagerProps & {theme: 'light' | 'dark'};

export class QuestionBuilderHome extends Component<QuestionBuilderHomeProps, QuestionBuilderHomeState> {

	constructor(props: QuestionBuilderHomeProps) {
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
					<QuestionManager {...this.props}/>
				);
			case 'multiple-choice': 
				return ( 
					<MultipleChoiceBuilder
						sets={this.props.sets}
						returnHome={() => this.setState({mode: 'home', isActive: true})}
						showSnackBar={this.props.showSnackBar}
					/>
				);
			default:
				return this.renderHomeScreen();
		}
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
}
