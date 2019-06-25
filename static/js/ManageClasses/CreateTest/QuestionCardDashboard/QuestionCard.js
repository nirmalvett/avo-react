import {Card, CardHeader, IconButton,} from "@material-ui/core";
import {Delete, Lock, LockOpen, Refresh} from "@material-ui/icons";
import React from "react";
import {getMathJax} from "../../../HelperFunctions/Utilities";
import {connect} from "react-redux";
import {
  actionCreateTestDeleteQuestion,
  actionCreateTestLockSeed,
  createTestQuestion
} from "../../../Redux/Actions/actionsMakeTest";
import {getAnswerInputs} from "./getAnswerInputs";

class QuestionCard extends React.Component {
  render () {
	/* This returns the the cards each of each will be a question card*/
	const {questionIndex, testQuestions} = this.props;
	const question = testQuestions[questionIndex];

	// if the index does not match the index list then don't load it yet
	if (question === undefined) return null;
	// otherwise just go ahead and load the QuestionCard
	else {
	  const totalQuestions = testQuestions.length;
	  return (
		  <Card
			  key={`Create-Test-Question-Card-index:${questionIndex}-id:${question.id}-seed:${question.seed}`}
			  style={{marginTop: '5%', marginBottom: '5%', padding: '10px'}}>
			<CardHeader
				title={question.name}
				subheader={'Question ' + (questionIndex + 1) + '/' + totalQuestions}
				action={
				  <div>
					<IconButton onClick={() => this.refresh (question, questionIndex)}>
					  <Refresh/>
					</IconButton>
					<IconButton onClick={() => this.lock (questionIndex)}>
					  {question.locked ? <Lock/> : <LockOpen/>}
					</IconButton>
					<IconButton onClick={() => this.deleteQuestion (questionIndex)}>
					  <Delete/>
					</IconButton>
				  </div>
				}
			/>
			{getMathJax (question.prompt, 'subheading')}
			{getAnswerInputs (question, question.prompts, questionIndex)}
		  </Card>
	  )
	}
  }


  deleteQuestion (questionIndex) {
	this.props.dispatch (actionCreateTestDeleteQuestion (questionIndex))
  }

  refresh (question, questionIndex) {
	this.props.dispatch (createTestQuestion (question, questionIndex));
  }

  lock (questionIndex) {
	this.props.dispatch (actionCreateTestLockSeed (questionIndex))
  }

}

function mapStateToProps ({createTest}) {
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


export default connect (mapStateToProps) (QuestionCard);

