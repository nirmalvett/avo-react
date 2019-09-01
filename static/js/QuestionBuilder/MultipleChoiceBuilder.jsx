import React, { Component } from 'react';
import * as Http from '../Http';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import Divider from '@material-ui/core/Divider';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Slide from '@material-ui/core/Slide';
import Paper from '@material-ui/core/Paper';
import Grow from '@material-ui/core/Grow';
import TextField from '@material-ui/core/TextField';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import Folder from '@material-ui/icons/Folder';
import Lock from '@material-ui/icons/Lock';
import CheckIcon from '@material-ui/icons/Check';
import DeleteIcon from '@material-ui/icons/Delete';
import Fab from '@material-ui/core/Fab';
import { InsertDriveFile as QuestionIcon, ArrowBack } from '@material-ui/icons/';
import {
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
} from '@material-ui/core';

export default class MultipleChoiceBuilder extends Component {
	
	constructor(props) {
		super(props);
		this.state = {
			loaded : false,  									 // Checks if the page has had all required data loaded
			questionName : '',                                   // Stores the question Name string
			questionNmeE : true, 								 // Keeps track of whether or not we're editing the question name
			questionText : '',								     // Stores the questions Prompt string 
			questionTxtE : true,								 // Keeps track of if we're editing the prompt
			questionOpts : ['Option 1', 'Option 2', 'Option 3'], // Stores the questions MC options
			questionEdit : [false, 		false, 		 false],     // Stores Which one the above mentioned choices we're editing
			questionAnsr : 0,								     // Stores the index of the correct options for the test
			questionExpl : '',								     // Stores the question Explanation String
			questionExpE : true,							     // Keeps track of if we're editing the explanation string
            sets         : this.props.initWith[2] || [],
            setsActive   : false,
            setQActive   : false,
            selectedS    : null,
		};
	};

	render() {
		return (
			<Grid container xs={12}>
				<Grid item xs={3}>
					<Slide in={this.state.loaded} direction="right" mountOnEnter unmountOnExit>
						<Paper className='avo-sidebar' style={{ height : '95vh' }}>
							{this.state.setQActive && (
								<IconButton aria-label="go back" size="small" onClick={this.goBackToSets.bind(this)}>
									<ArrowBack/>
								</IconButton>
							)}
							<Typography variant="subtitle1" gutterBottom>
								Question Sets
							</Typography>
							<Divider/>
							<Slide in={this.state.setsActive} direction='right' mountOnEnter unmountOnExit>
								<div>
									{this.renderSetList()}
								</div>
							</Slide>
							<Slide in={this.state.setQActive} direction='right' mountOnEnter unmountOnExit>
								<div>
									{this.renderQuestionList()}
								</div>
							</Slide>
						</Paper>
					</Slide>
				</Grid>
				<Grid item xs={9}>
					<Grow in={this.state.loaded}>
						<Paper 
							className='avo-card'
							style={{
								height : 'auto',
								width  : 'auto',
								maxHeight : '100%'
							}}
						>
							{!!this.state.questionNmeE ? (
								<span>
									<TextField
								        id="outlined-name"
								        label="Question Name"
								        margin="normal"
								        variant="outlined"
								        value={this.state.questionName}
								        onChange={(e) => this.setState({ questionName : e.target.value })}
								    />
						    	    <IconButton aria-label="save" size="small" onClick={() => this.setState({ questionNmeE : false })}>
							          	<SaveIcon fontSize="inherit" />
							        </IconButton>
								</span>
							) : (
								<span>
									<span style={{ float : 'left' }}>
							    		<Typography variant="subtitle1" gutterBottom>
											{this.state.questionName}
										</Typography>
									</span>
									<span>
										<IconButton aria-label="edit" size="small" onClick={() => this.setState({ questionNmeE : true })}>
								          	<EditIcon fontSize="inherit" />
								        </IconButton>
									</span>
								</span>
							)}
						    <br/>
						    <br/>
						    {!!this.state.questionTxtE ? (
								<span>
									<TextField
								        id="outlined-name"
								        label="Question Prompt"
								        multiline
		        						rows="2"
								        margin="normal"
								        variant="outlined"
								        style={{
								        	width : '90%'
								        }}
								        value={this.state.questionText}
								        onChange={(e) => this.setState({ questionText : e.target.value })}
								    />
						    	    <IconButton aria-label="save" size="small" onClick={() => this.setState({ questionTxtE : false })}>
							          	<SaveIcon fontSize="inherit" />
							        </IconButton>
								</span>
							) : (
								<span>
									<span style={{ float : 'left' }}>
							    		<Typography variant="body2" gutterBottom>
											{this.state.questionText}
										</Typography>
									</span>
									<span>
										<IconButton aria-label="edit" size="small" onClick={() => this.setState({ questionTxtE : true })}>
								          	<EditIcon fontSize="inherit" />
								        </IconButton>
									</span>
								</span>
							)}
						    <br/>
						    <br/>
							<FormControl component="fieldset">
						        <FormLabel component="legend">Answer Choices</FormLabel>
						        <RadioGroup
						          aria-label="multiple choice input"
						          name="choices"
						        >
						          	{this.state.questionOpts.map((string, index) => {
							          	return ( <FormControlLabel value={string} disabled control={<Radio />} label={
							          		<span>
								          		{!!this.state.questionEdit[index] ? (
								          			<span>
									          			<TextField
													        label={`Edit Choice #${index + 1}`}
													        onChange={(e) => { 
													        	let newArr = this.state.questionOpts;
													        	newArr[index] = e.target.value;
													        	this.setState({ questionOpts : newArr });
													        }} 
													        margin="normal"
													        variant="outlined"
													        value={string}
													    />
													    <IconButton aria-label="edit" size="small" onClick={() => {
									          				let newArr = this.state.questionEdit;
									          				newArr[index] = !newArr[index];
									          				this.setState({ 
									          					questionEdit : newArr 
									          				})
									          			}}>
												          	<SaveIcon fontSize="inherit" />
												        </IconButton>
												    </span>
								          		) : (
								          			<span>
									          			{string}
									          			<IconButton aria-label="edit" size="small" onClick={() => {
									          				let newArr = this.state.questionEdit;
									          				newArr[index] = !newArr[index];
									          				this.setState({ 
									          					questionEdit : newArr 
									          				})
									          			}}>
												          	<EditIcon fontSize="inherit" />
												        </IconButton>
												        <IconButton aria-label="delete" size="small" onClick={() => {
									          				let newArrQE = this.state.questionEdit;
									          				let newArrQO = this.state.questionOpts;
									          				newArrQE.splice(index, 1);
									          				newArrQO.splice(index, 1);
									          				this.setState({ 
									          					questionEdit : newArrQE, 
									          					questionOpts : newArrQO 
									          				})
									          			}}>
												          	<DeleteIcon fontSize="inherit" />
												        </IconButton>
												         <IconButton aria-label="set as correct Answer" size="small" onClick={() => {
									          				this.setState({ 
									          					questionAnsr : index, 
									          				})
									          			}}>
									          				{this.state.questionAnsr === index ? (
													          	<CheckIcon fontSize="inherit" />
									          				) : (
													          	<CloseIcon fontSize="inherit" />
									          				)}
												        </IconButton>
									          		</span>
								          		)}
							          		</span>
							          	} /> );
						   			})}
						        </RadioGroup>
						    </FormControl>
						    	<br/>
						      	<Fab
						          	variant="extended"
						          	size="small"
						          	color="primary"
						          	aria-label="add"
						          	onClick={() => {
						          		let newArrQE = this.state.questionEdit;
				          				let newArrQO = this.state.questionOpts;
				          				newArrQE.push(true);
				          				newArrQO.push('New Choice');
				          				this.setState({ 
				          					questionEdit : newArrQE, 
				          					questionOpts : newArrQO 
				          				});
						          	}}
						        >
						        	<AddIcon />
						          	Add Choice
						        </Fab>
						        <br/>
						        <br/>
						        {!!this.state.questionExpE ? (
									<span>
										<TextField
									        id="outlined-name"
									        label={`Explanation as to why the answer is ${this.state.questionOpts[this.state.questionAnsr]}`}
									        multiline
			        						rows="2"
									        margin="normal"
									        variant="outlined"
									        style={{
									        	width : '90%'
									        }}
									        value={this.state.questionExpl}
									        onChange={(e) => this.setState({ questionExpl : e.target.value })}
									    />
							    	    <IconButton aria-label="save" size="small" onClick={() => this.setState({ questionExpE : false })}>
								          	<SaveIcon fontSize="inherit" />
								        </IconButton>
									</span>
								) : (
									<span>
										<span style={{ float : 'left' }}>
								    		<Typography variant="body2" gutterBottom>
												{this.state.questionExpl}
											</Typography>
										</span>
										<span>
											<IconButton aria-label="edit" size="small" onClick={() => this.setState({ questionExpE : true })}>
									          	<EditIcon fontSize="inherit" />
									        </IconButton>
										</span>
									</span>
								)}
						</Paper>
					</Grow>
					<Fab
						style={{ position : 'absolute', bottom : '1em', right : '1em' }}
			          	color="primary"
			        >
			        	<SaveIcon />
			        </Fab>
				</Grid>
			</Grid>
		);
	};

	renderSetList() {
        let {selectedS} = this.state;
        return this.state.sets.map((set, index) => (
            <ListItem key={set.id + '-' + index} button onClick={() => this.selectSet(index)}>
                <ListItemIcon>
                    {set.can_edit ? (
                        <Folder color={selectedS === index ? 'primary' : 'action'} />
                    ) : (
                        <Lock color={selectedS === index ? 'primary' : 'action'} />
                    )}
                </ListItemIcon>
                <ListItemText primary={set.name} />
            </ListItem>
        ));
    };

    renderQuestionList() {
	    if (this.state.selectedS !== null)
	        return this.state.sets[this.state.selectedS].questions.map((question, index) => (
	            <ListItem
	                key={question.id + '-' + index}
	                button
	            >
	                <ListItemIcon>
	                    <QuestionIcon
	                        color={this.state.selectedQ === index ? 'primary' : 'action'}
	                    />
	                </ListItemIcon>
	                <ListItemText secondary={question.name} />
	            </ListItem>
	        ));
    }

	componentDidMount() {
		this.setState({ loaded : true });
		this.getSets();
	};

	selectSet(index) {
		this.setState({ selectedS : index, setsActive : false });
		setTimeout(() => {
			this.setState({ setQActive : true });
		}, 500);
	};

	goBackToSets() {
		this.setState({ setQActive : false });
		setTimeout(() => {
			this.setState({ setsActive : true });
		}, 500);
	};

	getSets = () => {
        Http.getSets(
            result => this.setState({sets: result.sets, setsActive : true }),
            () => alert('Something went wrong when retrieving your question list'),
        );
    };
};