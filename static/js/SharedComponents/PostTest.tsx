import React, {Component} from 'react';
import * as Http from '../Http';
import Card from '@material-ui/core/Card/Card';
import CardHeader from '@material-ui/core/CardHeader/CardHeader';
import {getMathJax} from '../HelperFunctions/Utilities';
import Divider from '@material-ui/core/Divider/Divider';
import AnswerInput from '../AnswerInput/AnswerInput';
import Typography from '@material-ui/core/Typography/Typography';
import {uniqueKey} from '../HelperFunctions/Helpers';

export interface PostTestProps {
    takes: number;
}

export default class PostTest extends Component<PostTestProps, Http.PostTest> {
    constructor(props: PostTestProps) {
        super(props);
        this.state = {
            questions: [],
        };
    }

    componentDidMount(): void {
        Http.postTest(
            this.props.takes,
            result => {
                this.setState(result);
            },
            () => {},
        );
    }

    render() {
        return (
            <div
                style={{
                    flex: 1,
                    paddingLeft: '10%',
                    paddingRight: '10%',
                    paddingTop: '20px',
                    paddingBottom: '20px',
                    overflowY: 'auto',
                }}
            >
                {this.state.questions.map(this.getQuestionCard)}
            </div>
        );
    }

    getQuestionCard = (question: Http.PostTestQuestion) => {
        return (
            <Card
                key={uniqueKey()}
                style={{
                    marginLeft: '10px',
                    marginRight: '10px',
                    marginTop: '20px',
                    marginBottom: '20px',
                    padding: '20px',
                }}
            >
                <CardHeader
                    title={getMathJax(question.prompt)}
                    style={{position: 'relative'}}
                    action={
                        <Typography variant='h5' color='primary'>
                            {question.scores.reduce((a, b) => a + b, 0)}/
                            {question.totals.reduce((a, b) => a + b, 0)}
                        </Typography>
                    }
                />
                {question.prompts.map((x, y) => [
                    <Divider key={uniqueKey()} style={{marginTop: '10px', marginBottom: '10px'}} />,
                    <AnswerInput
                        key={uniqueKey()}
                        disabled
                        type={question.types[y]}
                        value={question.answers[y]}
                        prompt={x}
                    />,
                ])}
                {question.explanation.map((x, y) => [
                    <Divider key={uniqueKey()} style={{marginTop: '10px', marginBottom: '10px'}} />,
                    <div key={uniqueKey()} style={{position: 'relative'}}>
                        <Typography
                            style={{position: 'absolute', right: '8px', top: '8px'}}
                            color='textSecondary'
                            variant='h6'
                        >
                            {question.scores[y]}/{question.totals[y]}
                        </Typography>
                        {getMathJax(x)}
                    </div>,
                ])}
            </Card>
        );
    };
}
