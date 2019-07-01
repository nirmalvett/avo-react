import React, {Component} from 'react';
import QuestionSidebar from "./QuestionSidebar"
import {connect} from 'react-redux';
import {getQuestionSets} from "../../Redux/Actions/actionsCreateTest";
import QuestionCardDashboard from "./QuestionCardDashboard/QuestionCardDashboard";

class CreateTest extends Component {
  constructor (props) {
	super (props);
  }

  componentDidMount () {
	this.props.dispatch (getQuestionSets());
  }

  render () {
	return (
		<div style={{display: 'flex', flexDirection: 'row', flex: 1}}>
		  <QuestionSidebar/>
		  <div style={{
			flex: 2,
			paddingLeft: '10%',
			paddingRight: '10%',
			paddingTop: '20px',
			paddingBottom: '20px',
			overflowY: 'auto'
		  }}>
			<QuestionCardDashboard onCreate={this.props.onCreate}/> {/* get each test question card */}
		  </div>
		</div>
	);
  }

}

export default connect () (CreateTest);