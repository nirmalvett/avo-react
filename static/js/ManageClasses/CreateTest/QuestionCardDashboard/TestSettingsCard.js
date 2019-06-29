import {Card, CardHeader, TextField,} from "@material-ui/core";
import React from "react";
import {connect} from "react-redux";
import {InlineDateTimePicker} from "material-ui-pickers";
import {
  actionCreateAttemptLimit,
  actionCreateAutoClose,
  actionCreateAutoOpen,
  actionCreateTestSetTestName,
  actionCreateTimeLimit
} from "../../../Redux/Actions/actionsMakeTest";
import {Done} from '@material-ui/icons';
import IconButton from "@material-ui/core/IconButton";

class TestSettingsCard extends React.Component {
  render () {
	return (
		<Card style={{marginTop: '5%', marginBottom: '5%', padding: '10px', flex: 1}}>
		  <CardHeader
			  title={'Test Settings'}
			  action={
				<IconButton
					color='primary'
					disabled={this.props.testQuestions.length === 0}
					onClick={() => this.clickTestSubmit()}>
				  <Done/>
				</IconButton>
			  }/>

		  <TextField
			  margin='normal'
			  label='Name'
			  style={{width: '46%', margin: '2%'}}
			  onChange={e => this.changeTestName (e.target.value)}
		  />
		  <TextField
			  margin='normal' label='Time Limit in Minutes' type='number'
			  style={{width: '46%', margin: '2%'}}
			  onChange={e => this.changeTimeLimit (e.target.value)}
		  />
		  <br/>
		  <TextField
			  margin='normal' label='Attempts' type='number'
			  style={{width: '46%', margin: '2%'}}
			  onChange={e => this.changeAttemptLimit (e.target.value)}
		  />
		  <InlineDateTimePicker
			  margin='normal'
			  style={{width: '46%', margin: '2%'}}
			  label="Deadline"
			  value={this.props.closeTime}
			  onChange={e => this.changeAutoClose(e)}
		  />
		  <InlineDateTimePicker
			  margin='normal'
			  style={{width: '46%', margin: '2%'}}
			  label="When to automatically open"
			  value={this.props.openTime}
			  onChange={e => this.changeAutoOpen(e)}
		  />
		</Card>
	)
  }



  /**
   * clickTestSubmit is triggered whenever you click on the submit
   */
  clickTestSubmit () {
	const s = this.props;
	let deadline = s.deadline.replace (/[\-T:]/g, '');
	if (deadline.length !== 12) {
	  alert ('Invalid deadline');
	  return;
	}
	if (this.props.testQuestions.length === 0) {
	  alert ('Test must contain 1 or more questions!');
	  return;
	}
  }

  changeTestName (name) {
	this.props.dispatch (actionCreateTestSetTestName (name));
  }

  changeAttemptLimit (limit) {
	this.props.dispatch (actionCreateAttemptLimit (limit));
  }

  changeAutoOpen (e) {
    const newDateString = e._d;
	this.props.dispatch (actionCreateAutoOpen(newDateString))
  }

  changeAutoClose (e) {
    const newDateString = e._d;
	this.props.dispatch (actionCreateAutoClose(newDateString));
  }

  changeTimeLimit (minuteInt) {
	this.props.dispatch (actionCreateTimeLimit (minuteInt));
  }
}

function mapStateToProps ({createTest}) {
  return {
	testQuestions: createTest.testQuestions,
	closeTime: createTest.closeTime,
	openTime: createTest.openTime,
	name: createTest.name,
	timeLimit: createTest.timeLimit,
	attempts: createTest.attempts
  }

}

export default connect (mapStateToProps) (TestSettingsCard);

