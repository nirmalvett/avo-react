import React from "react";
import {connect} from "react-redux";
import {
  actionCreateTestToggleAttemptLimit,
  actionCreateTestToggleCloseTime
} from "../../../../Redux/Actions/actionsCreateTest";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import {TextField} from "@material-ui/core";

/**
 * This component handles the attempts
 */
class Attempts extends React.Component {


  render () {
	return (
		<React.Fragment>
		  <FormControlLabel
			  control={
				<Switch
					checked={this.props.hasAttemptsLimit}
					value="checkedB"
					color="primary"
					onChange={() => this.props.dispatch (actionCreateTestToggleAttemptLimit())}
				/>
			  }
			  label="Limit number of attempts"
		  />
		  {
			this.props.hasAttemptsLimit
				? <TextField
					margin='normal' label='Attempts' type='number'
					style={{width: '46%', margin: '2%'}}
					onChange={e => this.changeAttemptLimit (e.target.value)}
					value={this.props.attempts}
				/>
				: null
		  }
		</React.Fragment>
	)
  }

}

function mapStateToProps ({createTest}) {
  return {
	attempts: createTest.attempts,
	hasAttemptsLimit: createTest.hasAttemptsLimit,

  }

}


export default connect (mapStateToProps) (Attempts);

