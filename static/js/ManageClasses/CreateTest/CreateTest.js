import React, { Component } from 'react';
import Http from '../../HelperFunctions/Http';
import { IconButton } from '@material-ui/core';
import { Done } from '@material-ui/icons';
import QuestionSidebar from "./QuestionSidebar"
import { connect } from 'react-redux';
import { getQuestionSets} from "../../Redux/Actions/actionsMakeTest";
import QuestionCardDashboard from "./QuestionCardDashboard/QuestionCardDashboard";

class CreateTest extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
      this.props.dispatch(getQuestionSets());
    }

	  render() {

        return (
            <div style={{display: 'flex', flexDirection: 'row', flex: 1}}>
              <QuestionSidebar />
                <div style={{ flex: 2, paddingLeft: '10%', paddingRight: '10%', paddingTop: '20px', paddingBottom: '20px', overflowY: 'auto'}}>
                    <QuestionCardDashboard /> {/* get each test question card */}
                </div>
            </div>
        );
    }

    handleDateChange(date) {
        var d = new Date(date);
        let _date = ("00" + (d.getMonth() + 1)).slice(-2) + "" +
            ("00" + d.getDate()).slice(-2) + "" +
            ("00" + d.getHours()).slice(-2) + "" +
            ("00" + d.getMinutes()).slice(-2) + "";
        _date = d.getFullYear() + "" + _date;
        this.setState({ deadline: _date, _deadline: date });
    };

    handleOpenChange(date) {
        var d = new Date(date);
        let _date = ("00" + (d.getMonth() + 1)).slice(-2) + "" +
            ("00" + d.getDate()).slice(-2) + "" +
            ("00" + d.getHours()).slice(-2) + "" +
            ("00" + d.getMinutes()).slice(-2) + "";
        _date = d.getFullYear() + "" + _date;
        this.setState({ openTime: _date, _openTime: date });
    };

    submitTest(){
        return (
            <IconButton disabled={this.state.testQuestions.length === 0} onClick={() => {
                            let s = this.state;
                            let questions = s.testQuestions.map(x => x.id);
                            let seeds = s.testQuestions.map(x => x.locked ? x.seed : -1);
                            let deadline = s.deadline.replace(/[\-T:]/g, '');
                            let openTime = s.openTime.replace(/[\-T:]/g, '');
                            if (deadline.length !== 12) {
                                alert('Invalid deadline');
                                return;
                            }

                            if (openTime.length !== 12){
                                alert('Invalid Auto Open Time');
                                return;
                            }
                            if(this.state.testQuestions.length === 0) {
                                alert('Test must contain 1 or more questions!');
                                return;
                            }
                            Http.saveTest(
                                this.props.classID,
                                s.name,
                                deadline,
                                openTime,
                                s.timeLimit,
                                s.attempts,
                                questions,
                                seeds,
                                () => {this.props.onCreate()},
                                () => {alert('Something went wrong')});
                        }} color='primary'>
                    <Done/>
                </IconButton>
        )
    }
}

export default connect()(CreateTest);