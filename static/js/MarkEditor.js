import React from 'react';
import Http from './Http';
import Grid from "@material-ui/core/Grid/Grid";
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

export default class MarkEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            questions: []
        };
        Http.postTest(this.props.takes, result => {
            this.setState(result);
            this.markButtonMarkers = this.state.questions.map((question) => {
                // {question.scores[y]}/{question.totals[y]}
                const questionSegments = question.explanation.map((explanation, idx) => {
                    return question.scores[idx];
                });
                return questionSegments;
            });
        }, () => {});
    }

    render() {
        return (
            <Grid container spacing={8}>
                <Grid xs={1}/>
                <Grid xs={10} style={{marginTop: '20px', marginBottom: '20px', overflowY: 'auto'}}>
                    {this.state.questions.map((x, y) => this.getQuestionCard(x, y))}
                </Grid>
                <Grid xs={1}/>
            </Grid>
        );
    }

    getQuestionCard(question, index) {
        return (
            <Card key = { uniqueKey() } style={{marginLeft: '10px', marginRight: '10px', marginTop: '20px', marginBottom: '20px', padding: '20px'}}>
                <CardHeader title={getMathJax(question.prompt)} style={{position: 'relative'}} action={
                    <Typography variant='headline' color='primary'>
                        {question.scores.reduce((a, b) => a+b, 0)}/{question.totals.reduce((a, b) => a+b, 0)}
                    </Typography>
                }/>
                {question.prompts.map((x, y) => [
                    <Divider key = { uniqueKey() } style={{marginTop: '10px', marginBottom: '10px'}}/>,
                    <AnswerInput key = { uniqueKey() } disabled type={question.types[y]} value={question.answers[y]} prompt={x}/>
                ])}
                {question.explanation.map((x, y) => [
                    <Divider key = { uniqueKey() } style={{marginTop: '10px', marginBottom: '10px'}}/>,
                    <div key = { uniqueKey() } style={{position: 'absolute', right: '8px', top: '8px'}}>
                        <IconButton onClick={() => this.handleClick(question.scores[y], index)}>
                            <Check/>
                        </IconButton>
                    </div>
                ])}
            </Card>
        );
    }

    handleClick(score, index) {
        console.log(score, index);
    }
}