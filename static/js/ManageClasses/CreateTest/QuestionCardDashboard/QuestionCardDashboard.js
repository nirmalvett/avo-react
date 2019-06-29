import React from "react";
import {connect} from "react-redux";
import QuestionCard from "./QuestionCard";
import TestSettingsCard from "./TestSettingsCard"

class QuestionCardDashboard extends React.Component {
  render () {

	/* This returns the the cards each of each will be a question card*/
	return (
		<React.Fragment>
		  { this.renderQuestionCards() }
		  <TestSettingsCard onCreate = {this.props.onCreate}/>
		</React.Fragment>
	)
  }

  renderQuestionCards () {
    /* This maps all the cards */
	const {testQuestions} = this.props;
	return (
		<React.Fragment>
		  {
			testQuestions.map (
				(question, questionIndex) => {
				  return (
					  <QuestionCard questionIndex={questionIndex}/>
				  )
				}
			)
		  }
		</React.Fragment>
	)

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

export default connect (mapStateToProps) (QuestionCardDashboard);

