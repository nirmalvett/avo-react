import React from 'react';
import Http from './Http';
import {getMathJax} from './Utilities';
import AnswerInput from './AnswerInput';
import Card from '@material-ui/core/Card/Card';
import Grid from '@material-ui/core/Grid/Grid';
import Button from '@material-ui/core/Button/Button';
import Divider from '@material-ui/core/Divider/Divider';
import CardHeader from '@material-ui/core/CardHeader/CardHeader';
import IconButton from '@material-ui/core/IconButton/IconButton';
import Typography from '@material-ui/core/Typography/Typography';
import Save from '@material-ui/icons/Save';

export default class TakeTest extends React.Component {
    constructor(props) {
        super(props);
        Http.getTest(this.props.testID, (result) => {
            result.newAnswers = JSON.parse(JSON.stringify(result.answers));
            this.setState(result);
            }, (result) => alert(result.error));
        this.state = {
            testID: this.props.testID,
            questions: [],
        };
    }

    render() {
        return (
            <Grid container spacing={8}>
                <Grid xs={1}/>
                <Grid xs={10} style={{marginTop: '20px', marginBottom: '20px', overflowY: 'auto'}}>
                    {this.state.questions.map((x, y) => this.getQuestionCard(x, this.state.answers[y], y))}
                    <div style={{marginLeft: '10px', marginRight: '10px', marginTop: '20px', marginBottom: '20px'}}>
                        <Button color='primary' variant='raised' style={{width: '100%'}} onClick={() => {
                            Http.submitTest(this.state.takes, result => {
                                alert('Success!')
                            }, result => {
                                alert('Something went wrong')
                            })
                        }}>
                            <Typography variant='button'>Submit Test</Typography>
                        </Button>
                    </div>
                </Grid>
                <Grid xs={1}/>
            </Grid>
        );
    }

    getQuestionCard(question, answer, index) {
        return (
            <Card style={{marginLeft: '10px', marginRight: '10px', marginTop: '20px', marginBottom: '20px', padding: '20px'}}>
                <CardHeader title={getMathJax(question.prompt)} action={<IconButton onClick={() => {
                    Http.saveAnswer(this.state.takes, index, this.state.newAnswers[index], result => {}, result => {
                        alert(result.error);
                    });
                }}><Save/></IconButton>}/>
                {question.prompts.map((x, y) => [
                    <Divider style={{marginTop: '10px', marginBottom: '10px'}}/>,
                    <AnswerInput type={question.types[y]} value={answer[y]} prompt={x} onChange={value => {
                        let newAnswerList = JSON.parse(JSON.stringify(this.state.newAnswers));
                        newAnswerList[index][y] = value;
                        this.setState({newAnswers: newAnswerList});
                    }}/>
                ])}
            </Card>
        );
    }
}