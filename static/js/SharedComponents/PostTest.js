import React from 'react';
import Http from '../HelperFunctions/Http';
import Card from "@material-ui/core/Card/Card";
import CardHeader from "@material-ui/core/CardHeader/CardHeader";
import {getMathJax} from "../HelperFunctions/Utilities";
import Divider from "@material-ui/core/Divider/Divider";
import AnswerInput from "../AnswerInput/AnswerInput";
import Typography from "@material-ui/core/Typography/Typography";
import {uniqueKey} from "../HelperFunctions/helpers";

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
            <div style={{
				flex: 1,
				paddingLeft: '10%',
				paddingRight: '10%',
				paddingTop: '20px',
				paddingBottom: '20px',
				overflowY: 'auto'
			}}>
                {this.state.questions.map((x, y) => this.getQuestionCard(x, y))}
            </div>
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
                    <div key = { uniqueKey() } style={{position: 'relative'}}>
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
