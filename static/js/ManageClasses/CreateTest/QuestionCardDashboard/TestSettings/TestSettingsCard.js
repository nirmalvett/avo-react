import {Card, CardHeader, TextField,} from "@material-ui/core";
import React from "react";
import {connect} from "react-redux";
import {InlineDateTimePicker} from "material-ui-pickers";
import {
  actionCreateAttemptLimit,
  actionCreateAutoClose,
  actionCreateAutoOpen,
  actionCreateTestSetTestName,
  actionCreateTestSubmitTest,
  actionCreateTimeLimit
} from "../../../../Redux/Actions/actionsCreateTest";
import {Done} from '@material-ui/icons';
import IconButton from "@material-ui/core/IconButton";
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import AutoCloseTest from "./AutoCloseTest"
import AutoOpenTest from "./AutoOpenTest"
import Attempts from "./Attempts"
import TimeLimit from "./TimeLimit"
class TestSettingsCard extends React.Component {
  render () {
	return (
		<Card style={{marginTop: '5%', marginBottom: '5%', padding: '10px', flex: 1, justifyContent: 'space-between'}}>
		  <CardHeader
			  title={'Test Settings'}
			  action={
				<IconButton
					color='primary'
					disabled={!this.enableSubmitButton ()}
					onClick={() => this.clickTestSubmit ()}>
				  <Done/>
				</IconButton>
			  }/>
		  <TextField
			  margin='normal'
			  label='Name'
			  style={{width: '46%', margin: '2%'}}
			  onChange={e => this.changeTestName (e.target.value)}
		  />
		  <br/>
		  <TimeLimit />
		  <br/>
		  <Attempts/>
		  <br/>
		  <AutoOpenTest />
		  <br/>
		  <AutoCloseTest/>



		</Card>
	)
  }

  /**
   * clickTestSubmit is triggered whenever you click on the submit
   */
  clickTestSubmit () {
	const {onCreate, dispatch} = this.props;
	actionCreateTestSubmitTest (onCreate, this.props);
  }

  /**
   * method returns true if one of the fields is not properly filled yet
   */
  enableSubmitButton () {
	const {attempts, closeTime, name, openTime, testQuestions, timeLimit} = this.props;
	if (openTime === null || closeTime === null) return false;
	else if (name.length === 0) return false;
	else if (testQuestions.length === 0) return false;
	else if (timeLimit === null) return false;
	else if (attempts === null) return false;
	return true;
  }

  changeTestName (name) {
	this.props.dispatch (actionCreateTestSetTestName (name));
  }

  changeAttemptLimit (limit) {
	this.props.dispatch (actionCreateAttemptLimit (limit));
  }

}

function mapStateToProps ({createTest}) {
  return {
	testQuestions: createTest.testQuestions,
	closeTime: createTest.closeTime,
	openTime: createTest.openTime,
	name: createTest.name,
	timeLimit: parseInt (createTest.timeLimit),
	attempts: parseInt (createTest.attempts),
	classId: createTest.classId,
	hasCloseTime: createTest.hasCloseTime,
	hasOpentime: createTest.hasOpenTime,
	hasAttemptLimit: createTest.hasAttemptLimit,
	hasTimeLimit: createTest.hasTimeLimit,
  }

}


export default connect (mapStateToProps) (TestSettingsCard);

