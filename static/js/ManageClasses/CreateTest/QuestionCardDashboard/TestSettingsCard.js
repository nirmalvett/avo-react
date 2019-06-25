import {Card, CardHeader, TextField,} from "@material-ui/core";
import React from "react";
import {connect} from "react-redux";
import {InlineDateTimePicker} from "material-ui-pickers";
import {actionCreateTestSetTestName} from "../../../Redux/Actions/actionsMakeTest";

class TestSettingsCard extends React.Component {
  render () {
	return (
		<Card style={{marginTop: '5%', marginBottom: '5%', padding: '10px', flex: 1}}>
		  <CardHeader title={'Test Settings'}/>
		  <TextField
			  margin='normal'
			  label='Name'
			  style={{width: '46%', margin: '2%'}}
			  onChange={e => this.changeTestName(e.target.value)}
		  />
		  <TextField
			  margin='normal' label='Time Limit in Minutes (-1 for unlimited)' type='number'
			  style={{width: '46%', margin: '2%'}}/>
		  <br/>
		  <TextField margin='normal' label='Attempts (-1 for unlimited)' type='number'
					 style={{width: '46%', margin: '2%'}}/>
		  <InlineDateTimePicker
			  margin='normal'
			  style={{width: '46%', margin: '2%'}}
			  label="Deadline"
		  />
		  <InlineDateTimePicker
			  margin='normal'
			  style={{width: '46%', margin: '2%'}}
			  label="Test Auto Open Time"
		  />
		</Card>
	)
  }

  changeTestName (name) {
	this.props.dispatch(actionCreateTestSetTestName(name));
  }

  /*
  *
  *
  * 	<Card style={{marginTop: '5%', marginBottom: '5%', padding: '10px', flex: 1}}>
			<CardHeader title={'Test Settings'} action={this.submitTest ()}/>
			<TextField
				margin='normal'
				label='Name'
				style={{width: '46%', margin: '2%'}}
				onChange={e => this.setState ({name: e.target.value})}
			/>
			<TextField
				margin='normal' label='Time Limit in Minutes (-1 for unlimited)' type='number'
				style={{width: '46%', margin: '2%'}}
				onChange={e => this.setState ({timeLimit: e.target.value})}/>
			<br/>
			<TextField margin='normal' label='Attempts (-1 for unlimited)' type='number'
					   style={{width: '46%', margin: '2%'}}
					   onChange={e => this.setState ({attempts: e.target.value})}/>
			<InlineDateTimePicker
				margin='normal'
				style={{width: '46%', margin: '2%'}}
				label="Deadline"
				value={this.state._deadline}
				onChange={this.handleDateChange.bind (this)}
			/>
			<InlineDateTimePicker
				margin='normal'
				style={{width: '46%', margin: '2%'}}
				label="Test Auto Open Time"
				value={this.state._openTime}
				onChange={this.handleOpenChange.bind (this)}
			/>
		  </Card>*/

}

export default connect () (TestSettingsCard);

