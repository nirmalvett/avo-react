import React from 'react';
import Card from "@material-ui/core/Card/Card";
import CardHeader from "@material-ui/core/CardHeader/CardHeader";
import {copy, getMathJax} from "./Utilities";
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
    

    render() {
        return (
            <Card key = {`QuestionCard-QIndex:${this.props.index}` } style={{marginLeft: '10px', marginRight: '10px', marginTop: '20px', marginBottom: '20px', padding: '20px', position : 'relative'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Typography variant='title'> { getMathJax(this.props.question.prompt) } </Typography>
                     <Typography variant='headline' color='primary'>
                        {this.state.buttonMarkValue.reduce((a, b) => a+b, 0)}/{this.props.question.totals.reduce((a, b) => a+b, 0)}
                    </Typography>
                </div>
                <br/>

                {this.props.question.prompts.map((x, y) =>
                    <React.Fragment>
                        <Divider key = { `Divider-QIndex:${this.props.index}-Index:${y}` } style={{marginTop: '10px', marginBottom: '10px'}}/>
                        <AnswerInput
                            key = {  `AnswerInput-QIndex:${this.props.index}-Index:${y}`  }
                            disabled type={this.props.question.types[y]} value={this.props.question.answers[y]} prompt={x}/>
                    </React.Fragment>
                    )}
                {this.props.question.explanation.map((x, y) =>
                    <div>
                        <Divider key = {  `Divider-Explanation-QIndex:${this.props.index}-Index:${y}`  } style={{marginTop: '10px', marginBottom: '10px'}}/>
                        { editButton(this.state.buttonMarkValue[y], this.props.index, y, this.handleClick.bind(this))}
                        {   getMathJax(x)   }
                    </div>
                )}
            </Card>
        );
    };

    handleClick(score, index, idx) {
        let newArray = this.state.buttonMarkValue;
        let newScore = score === 0
            ? 1
            : 0;
        newArray[idx] = newScore;
        this.setState({ buttonMarkValue : newArray });
        this.props.markButtonMarkers[index] = newArray;
    }

};

function editButton(buttonMarkValue, propsIndex, y, handleClick){
    return (
        <div key = {  `OuterMarkEditorDiv-Index:${y}`  } style={{position: 'relative'}}>
            <div style={{position: 'absolute', right: '8px', top: '8px'}}>
                <IconButton onClick={() => handleClick(buttonMarkValue, propsIndex, y)}>
                    {buttonMarkValue === 1 ? (
                        <Check/>
                    ) : (
                        <Close/>
                    )}
                </IconButton>
            </div>
        </div>
    )
}