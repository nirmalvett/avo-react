import React from 'react';
import Card from "@material-ui/core/Card/Card";
import CardHeader from "@material-ui/core/CardHeader/CardHeader";
import {copy, getMathJax} from "./Utilities";
import Divider from "@material-ui/core/Divider/Divider";
import AnswerInput from "./AVOAnswerInput/AnswerInput";
import Typography from "@material-ui/core/Typography/Typography";
import IconButton from '@material-ui/core/IconButton/IconButton';
import {uniqueKey} from "./helpers";
import Tooltip from '@material-ui/core/Tooltip';
import Check from '@material-ui/icons/Check';
import Close from '@material-ui/icons/Close';

export const CONST_MARKED_CORRECT = 1;
export const CONST_MARKED_INCORRECT = 0;
export default class MarkEditorQuestionCard extends React.Component {

	constructor(props = {}) {
		super(props);
		this.state = {
			buttonMarkValue: this.props.qMarks,
			marksScored: this.props.question.scores.reduce(function (acc, val) {
				return acc + val;
			}, 0) // marks scored
		};
	};

	componentDidMount() {
		// get the max marks this never changes so we only calculate this once
		this.maxMarks = this.props.question.totals.reduce(function (acc, val) {
			return acc + val;
		}, 0);
	}


	render() {
		return (
				<Card
						key={`QuestionCard-QIndex:${this.props.index}`}
						style={{
							marginLeft: '10px',
							marginRight: '10px',
							marginTop: '20px',
							marginBottom: '20px',
							padding: '20px',
							position: 'relative'
						}}
				>
					<CardHeader
							title={getMathJax(`(Question ${this.props.index + 1}): ${this.props.question.prompt}`)}
							style={{position: 'relative'}}
							action={
								<Typography variant='headline' color='primary'>
									{`${this.state.marksScored}/${this.maxMarks}`}
								</Typography>
							}
							key={`CardHeader-QIndex:${this.props.index}`}
					/>
					<br/>
					{this.renderPrompts()}
					{this.renderAnswers()}


				</Card>
		);
	}

	handleClick(score, index, idx) {
		let newArray = this.state.buttonMarkValue;
		// if score is 0 then it's marked wrong then mark it as 1 for the server, otherwise 0.
		// this is because the server takes an array of ints which represent whether it's all correct or not
		newArray[idx] = score === 0 ? CONST_MARKED_CORRECT : CONST_MARKED_INCORRECT;
		this.setState({
			buttonMarkValue: newArray,
			marksScored: this.accumulateCurrentScore()
		});
		this.props.markButtonMarkers[index] = newArray;
	}

	accumulateCurrentScore() {
		// we have this.state.buttonMarkValue which [0, 1, 1] where 1 is that it's marked correct and 0 otherwise
		// we have this.props.question.totals which is an array of ints indicating what each question mark is worth
		// this method compares the mark value and accumulates the total accordingly by mapping it to the score total
		const buttonValueArray = this.state.buttonMarkValue; // [0, 1] where 0 means marked false, 1 marked true
		const totalsArray = this.props.question.totals; // [0.25, 0.25] where each is the score worth of each part
		let accumulatedValue = 0;
		for (let i = 0; i < buttonValueArray.length; i++) {
			const currentButtonValue = buttonValueArray[i];
			if (currentButtonValue === 1) {
				accumulatedValue += totalsArray[i]
			}
		}
		return accumulatedValue;
	}

	renderPrompts() {
		return (
				<React.Fragment>
					{this.props.question.prompts.map((x, y) =>
							<React.Fragment key={`Fragment1-Explanation-QIndex:${this.props.index}-Index:${y}`}>
								<Divider
										key={`Divider-QIndex:${this.props.index}-Index:${y}`}
										style={{marginTop: '10px', marginBottom: '10px'}}/>
								<AnswerInput
										key={`AnswerInput-QIndex:${this.props.index}-Index:${y}`}
										disabled type={this.props.question.types[y]} value={this.props.question.answers[y]} prompt={x}/>
							</React.Fragment>
					)}
				</React.Fragment>
		)
	}

	renderAnswers() {
		return (
				<React.Fragment>
					{
						this.props.question.explanation.map((x, y) =>
								<React.Fragment>
									<Divider key={`Divider2-Explanation-QIndex:${this.props.index}-Index:${y}`} style={{marginTop: '10px', marginBottom: '10px'}}/>
									{ this.editMarkButton(y) }
									<div key={`MathJax-QIndex:${this.props.index}-Index:${y}`}>
										<br/>
										{getMathJax(x)}
										<br/>
									</div>

								</React.Fragment>
						)}
				</React.Fragment>
		)
	}

	editMarkButton(y) {
		return (
				<div key={`OuterDiv-QIndex:${this.props.index}-Index:${y}`} style={{position: 'relative'}}>
					<div key={`InnerDiv-QIndex:${this.props.index}-Index:${y}`}
					     style={{position: 'absolute', right: '8px', top: '8px'}}>
						<Tooltip key={`Tooltip-QIndex:${this.props.index}-Index:${y}`}
						         title={`${this.state.buttonMarkValue[y] === 1 ? 'Remove a point' : 'Give a point'}`}>
							<IconButton key={`IconButton-QIndex:${this.props.index}-Index:${y}`}
							            onClick={() => this.handleClick(this.state.buttonMarkValue[y], this.props.index, y)}>
								{this.state.buttonMarkValue[y] === CONST_MARKED_CORRECT ? (
										<Check key={`IconButton-Check-QIndex:${this.props.index}-Index:${y}`}/>
								) : (
										<Close key={`IconButton-X-QIndex:${this.props.index}-Index:${y}`}/>
								)}
							</IconButton>
						</Tooltip>
					</div>
				</div>
		)
	}


}
