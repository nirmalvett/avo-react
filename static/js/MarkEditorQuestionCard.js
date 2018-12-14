import React from 'react';
import Card from "@material-ui/core/Card/Card";
import CardHeader from "@material-ui/core/CardHeader/CardHeader";
import {getMathJax} from "./Utilities";
import Divider from "@material-ui/core/Divider/Divider";
import AnswerInput from "./AVOAnswerInput/AnswerInput";
import Typography from "@material-ui/core/Typography/Typography";
import IconButton from '@material-ui/core/IconButton/IconButton';
import {uniqueKey} from "./helpers";
import Check from '@material-ui/icons/Check';
import Close from '@material-ui/icons/Close';

export default class MarkEditorQuestionCard extends React.Component {

    constructor(props = {}) {
        super(props);
        this.state = {
            buttonMarkValue: this.props.qMarks,
        };
    };

    componentDidMount(){
        this.uniqueKey1 = uniqueKey();
    }

    render() {
        const uniqueKey1 = this.uniqueKey1;
        return (
            <Card key = { uniqueKey() } style={{marginLeft: '10px', marginRight: '10px', marginTop: '20px', marginBottom: '20px', padding: '20px', position : 'relative'}}>
                <CardHeader title={getMathJax(this.props.question.prompt)} style={{position: 'relative'}} action={
                    <Typography variant='headline' color='primary'>
                        {this.state.buttonMarkValue.reduce((a, b) => a+b, 0)}/{this.props.question.totals.reduce((a, b) => a+b, 0)}
                    </Typography>
                }/>

                {this.props.question.prompts.map((x, y) =>
                    <React.Fragment>
                        <Divider key = { `Divider-Index:${y}Key:${uniqueKey1}` } style={{marginTop: '10px', marginBottom: '10px'}}/>
                        <AnswerInput
                            key = {  `AnswerInput-Index:${y}Key:${uniqueKey1}`  }
                            disabled type={this.props.question.types[y]} value={this.props.question.answers[y]} prompt={x}/>
                    </React.Fragment>
                    )}
                {this.props.question.explanation.map((x, y) =>
                    <React.Fragment>
                        <Divider key = {  `Divider-Explanation-Index:${y}Key:${uniqueKey1}`  } style={{marginTop: '10px', marginBottom: '10px'}}/>

                        <div key = {  `OuterMarkEditorDiv-Index:${y}Key:${uniqueKey1}`  } style={{position: 'relative'}}>
                            <div style={{position: 'absolute', right: '8px', top: '8px'}}>
                                <IconButton onClick={() => this.handleClick(this.state.buttonMarkValue[y], this.props.index, y)}>
                                    {this.state.buttonMarkValue[y] === 1 ? (
                                        <Check/>
                                    ) : (
                                        <Close/>
                                    )}
                                </IconButton>
                            </div>
                        </div>
                        <div>{getMathJax(x)}</div>
                    </React.Fragment>
                )}
            </Card>
        );
    };

    handleClick(score, index, idx) {
        let newArray = this.state.buttonMarkValue;
        let newScore = score === 0 ? 1 : 0;
        newArray[idx] = newScore;
        this.setState({ buttonMarkValue : newArray });
        this.props.markButtonMarkers[index] = newArray;
    }

};