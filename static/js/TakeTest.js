import React, {Component} from 'react';
import Http from './Http';
import {copy, getMathJax} from './Utilities';
import AnswerInput from './AVOAnswerInput/AnswerInput';
import Card from '@material-ui/core/Card/Card';
import Button from '@material-ui/core/Button/Button';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import Divider from '@material-ui/core/Divider/Divider';
import CardHeader from '@material-ui/core/CardHeader/CardHeader';
import IconButton from '@material-ui/core/IconButton/IconButton';
import Typography from '@material-ui/core/Typography/Typography';
import Save from '@material-ui/icons/Save';

// This is a Card that says the title of the test and tells students to email us if they need help
function getFirstCard() {
	return (
		<Card style={{marginLeft: '10px', marginRight: '10px', marginTop: '20px', marginBottom: '20px', padding: '20px'}}>
			{/*<CardHeader title={testName}/>*/}
			<Typography>
				If you run into any issues please email <a>contact@avocadocore.com</a>.
				Our team will be quick to respond and assist you.
			</Typography>
		</Card>
	)
}


export default class TakeTest extends Component {
	constructor(props) {
		super(props);
		this.state = this.props.test;

		/* this.state actually looks like this
		 {
				answers: (6) [Array(1), Array(1), Array(3), Array(1), Array(4), Array(1)],
				newAnswers: (6) [Array(1), Array(1), Array(3), Array(1), Array(4), Array(1)],
				questions: (6) [{…}, {…}, {…}, {…}, {…}, {…}],
				takes: 92,
				testID: 28,
				time_submitted: 20181030163809,
				timer: 9333.94 // i.e. the amount of minutes
		 }
		*/
	}

	render() {
		return (
			<div style={{
				flex: 1,
				paddingLeft: '10%',
				paddingRight: '10%',
				paddingTop: '20px',
				paddingBottom: '20px',
				overflowY: 'auto'
			}}>
				{getFirstCard()}
				{this.state.questions.map((x, y) => this.getQuestionCard(x, this.state.answers[y], y))}
				<div style={{marginLeft: '10px', marginRight: '10px', marginTop: '20px', marginBottom: '20px'}}>
					<Button color='primary'
							variant='raised'
							style={{width: '100%', color: 'white'}}
							id="avo-test__submit-button"
							onClick={() => this.submitTest()}
					>
						Submit Test
					</Button>
				</div>
			</div>
		);
	}

	submitTest() {
		Http.submitTest(this.state.takes,
			() => this.props.submitTest(this.state.takes),
			() => alert('Something went wrong')
		);
	}

	getQuestionCard(question, answer, index) {
		let disabled = JSON.stringify(this.state.newAnswers[index]) === JSON.stringify(this.state.answers[index]);
		let saveButtonInput = newAnswerList => {
			Http.saveAnswer(this.state.takes, index, newAnswerList[index], () => {
				let newAnswers = copy(this.state.answers);
				newAnswers[index] = copy(newAnswerList[index]);
				this.setState({answers: newAnswers});
			}, result => {
				alert(result.error);
			});
		};
		let save = (inputValue) => {
			let newValue = inputValue === undefined ? this.state.newAnswers[index] : inputValue;
			Http.saveAnswer(this.state.takes, index, newValue,
				() => {
					let newAnswers = copy(this.state.answers);
					newAnswers[index] = copy(this.state.newAnswers[index]);
					this.setState({answers: newAnswers});
				},
				result => alert(result.error)
			);
		};
		return (
			<Card
					style={{marginLeft: '10px', marginRight: '10px', marginTop: '20px', marginBottom: '20px', padding: '20px'}}>
				<CardHeader title={getMathJax((index + 1) + '. ' + question.prompt)} action={
					disabled
							? <Tooltip title="Nothing to save">
								<span><IconButton disabled={true} color='disabled'><Save/></IconButton></span>
							</Tooltip>
							: <IconButton onClick={save} color='primary'><Save/></IconButton>
				}/>
				{question.prompts.map((x, y) => [
					<Divider style={{marginTop: '10px', marginBottom: '10px'}}/>,
					<AnswerInput
						type={question.types[y]} value={answer[y]} prompt={x}
						onBlur={save}
						onChange={value => {
							let newAnswerList = copy(this.state.newAnswers);
							newAnswerList[index][y] = value;
							this.setState({newAnswers: newAnswerList});
						}}
						buttonSave={value => {
							let newAnswerList = copy(this.state.newAnswers);
							newAnswerList[index][y] = value;
							this.setState({newAnswers: newAnswerList});
							saveButtonInput(newAnswerList);
						}}
					/>
				])}
			</Card>
		);
	}
}
