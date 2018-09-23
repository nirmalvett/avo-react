import React from 'react';
import Http from './Http';
import Grid from "@material-ui/core/Grid/Grid";
import Card from "@material-ui/core/Card/Card";
import CardHeader from "@material-ui/core/CardHeader/CardHeader";
import {getMathJax} from "./Utilities";
import Divider from "@material-ui/core/Divider/Divider";
import AnswerInput from "./AnswerInput";
import Typography from "@material-ui/core/Typography/Typography";

export default class PostTest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            questions: []
        };
        Http.postTest(this.props.takes, result => {
            this.setState(result);
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
            <Card style={{marginLeft: '10px', marginRight: '10px', marginTop: '20px', marginBottom: '20px', padding: '20px'}}>
                <CardHeader title={getMathJax(question.prompt)} style={{position: 'relative'}} action={
                    <Typography variant='headline' color='primary'>
                        {question.scores.reduce((a, b) => a+b, 0)}/{question.totals.reduce((a, b) => a+b, 0)}
                    </Typography>
                }/>
                {question.prompts.map((x, y) => [
                    <Divider style={{marginTop: '10px', marginBottom: '10px'}}/>,
                    <AnswerInput disabled type={question.types[y]} value={question.answers[y]} prompt={x}/>
                ])}
                {question.explanation.map((x, y) => [
                    <Divider style={{marginTop: '10px', marginBottom: '10px'}}/>,
                    <div style={{position: 'relative'}}>
                        <Typography style={{position: 'absolute', right: '8px', top: '8px'}}
                                    color='textSecondary' variant='title'>
                            {question.scores[y]}/{question.totals[y]}
                        </Typography>
                        {getMathJax(x)}
                    </div>
                ])}
            </Card>
        );
    }
}