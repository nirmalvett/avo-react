import React from "react";
import {connect} from "react-redux";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import {TextField} from "@material-ui/core";
import {actionCreateTestToggleTimeLimit, actionCreateTimeLimit} from "../../../../Redux/Actions/actionsCreateTest";

/**
 * This component handles whether or not there is a time limit
 */
class TimeLimit extends React.Component {


  render () {
	return (
		<React.Fragment>
		  <FormControlLabel
			  control={
				<Switch
					checked={this.props.hasTimeLimit}
					color="primary"
					onChange={() => this.props.dispatch(actionCreateTestToggleTimeLimit())}
				/>
			  }
			  label="Add Time Limit"
		  />
		  {
			this.props.hasTimeLimit
				? <TextField
					margin='normal' label='Time Limit in Minutes'
					type='number'
					style={{width: '46%', margin: '2%'}}
					onChange={e => this.changeTimeLimit (e.target.value)}
					/>
				: null
		  }
		</React.Fragment>
	)
  }

  changeTimeLimit (minuteInt) {
	this.props.dispatch (actionCreateTimeLimit (minuteInt));
  }

}

function mapStateToProps ({createTest}) {
  return {
	timeLimit: createTest.timeLimit,
	hasTimeLimit: createTest.hasTimeLimit,

  }
}


export default connect (mapStateToProps) (TimeLimit);

