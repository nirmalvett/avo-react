import React from "react";
import {connect} from "react-redux";
import {DateTimePicker} from "@material-ui/pickers";
import {actionCreateAutoClose, actionCreateTestToggleCloseTime} from "../../../../Redux/Actions/actionsCreateTest";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";

/**
 * This component handles the options for automatic closing of a test
 */
class AutoCloseTest extends React.Component {


  render () {
	return (
		<React.Fragment>
		  <FormControlLabel
			  control={
				<Switch
					checked={this.props.hasCloseTime}
					value="checkedB"
					color="primary"
					onChange={() => this.props.dispatch (actionCreateTestToggleCloseTime ())}
				/>
			  }
			  label="Auto close test"
		  />
		  {
			this.props.hasCloseTime
				? <DateTimePicker
					margin='normal'
					style={{width: '46%', margin: '2%'}}
					label="Deadline"
					value={this.props.closeTime}
					onChange={e => this.changeAutoClose (e)}
					variant='inline'
				/>
				: null
		  }
		</React.Fragment>
	)
  }

  changeAutoClose (e) {
	const newDateString = e._d;
	this.props.dispatch (actionCreateAutoClose (newDateString));
  }
}

function mapStateToProps ({createTest}) {
  return {
	closeTime: createTest.closeTime,
	hasCloseTime: createTest.hasCloseTime,
  }

}


export default connect (mapStateToProps) (AutoCloseTest);

