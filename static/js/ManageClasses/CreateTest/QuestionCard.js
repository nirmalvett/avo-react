import {Card, CardHeader, IconButton,} from "@material-ui/core";
import {Delete, Lock, LockOpen, Refresh} from "@material-ui/icons";
import React from "react";
import {getMathJax} from "../../HelperFunctions/Utilities";
import AnswerInput from "../../AnswerInput/AnswerInput";
import {connect} from "react-redux";
import {
  actionCreateTestDeleteQuestion,
  actionCreateTestLockSeed,
  createTestQuestion
} from "../../Redux/Actions/actionsMakeTest";


class QuestionCard extends React.Component {
  render() {
	const {testQuestions} = this.props;
	/* This returns the the cards each of each will be a question card*/
	return (
		<React.Fragment>
		  {
			testQuestions.map(
				(question, questionIndex) => {
				  return (this.singleCard(question, questionIndex, testQuestions.length))
				}
			)
		  }
		</React.Fragment>
	)
  }

  singleCard(question, questionIndex, totalQuestions) {
	return (
		<Card
			key={`Create-Test-Question-Card-index:${questionIndex}-id:${question.id}-seed:${question.seed}`}
			style={{marginTop: '5%', marginBottom: '5%', padding: '10px'}}>
		  <CardHeader
			  title={question.name}
			  subheader={'Question ' + (questionIndex + 1) + '/' + totalQuestions}
			  action={
				<div>
				  <IconButton onClick={() => this.refresh(question, questionIndex)}>
					<Refresh/>
				  </IconButton>
				  <IconButton onClick={() => this.lock(questionIndex)}>
					{question.locked ? <Lock/> : <LockOpen/>}
				  </IconButton>
				  <IconButton onClick={() => this.deleteQuestion(questionIndex)}>
					<Delete/>
				  </IconButton>
				</div>
			  }
		  />
		  {getMathJax(question.prompt, 'subheading')}
		  {getAnswerInputs(question, question.prompts, questionIndex)}
		</Card>
	)
  }

  deleteQuestion(questionIndex) {
	  this.props.dispatch(actionCreateTestDeleteQuestion(questionIndex))
  }

  refresh(question, questionIndex){
	this.props.dispatch(createTestQuestion(question, questionIndex));
  }

  lock(questionIndex){
	this.props.dispatch(actionCreateTestLockSeed(questionIndex))
  }

}

function getAnswerInputs(question, promptList, questionIndex) {
  /* question.prompts array of questionPromptList*/
  return (
	  <React.Fragment>
		{
		  promptList.map(
			  (a, b) =>
				  <AnswerInput
					  key={`Create-Test-Answer-index:${questionIndex}-${b}-`}
					  value=''
					  disabled prompt={a}
					  type={question.types[b]}/>
		  )
		}
	  </React.Fragment>
  )
}

function mapStateToProps({createTest}) {
  if (createTest === undefined) {
	return {
	  testQuestions: []
	}
  } else {
	return {
	  testQuestions: createTest.testQuestions
	}
  }

}

export default connect(mapStateToProps)(QuestionCard);

