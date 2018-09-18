import React from 'react';
import Typography from '@material-ui/core/Typography/Typography';
import Grid from "@material-ui/core/Grid/Grid";
import Card from "@material-ui/core/Card/Card";
import AvoHttp from "./Http";
import Divider from "@material-ui/core/Divider/Divider";
import TextField from "@material-ui/core/TextField/TextField";
import Button from "@material-ui/core/Button/Button";
import Save from '@material-ui/icons/Save';
import IconButton from "@material-ui/core/IconButton/IconButton";
import CardHeader from "@material-ui/core/CardHeader/CardHeader";
import NumberInput from "./input/NumberInput";
import VectorInput from "./input/VectorInput";
import MatrixInput from "./input/MatrixInput";
import {getMathJax} from "./Utilities";

export default class TakeTest extends React.Component {
    constructor(props) {
        super(props);
        AvoHttp.getTest(this.props.testID, (result) => {
            console.log(result);
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
                    {this.state.questions.map((x, y) => this.getQuestionCard(x, this.state.answers[y]))}
                    <div style={{marginLeft: '10px', marginRight: '10px', marginTop: '20px', marginBottom: '20px'}}>
                        <Button color='primary' variant='raised' style={{width: '100%'}}>
                            <Typography variant='button'>Submit Test</Typography>
                        </Button>
                    </div>
                </Grid>
                <Grid xs={1}/>
            </Grid>
        );
    }

    getQuestionCard(question, answer) {
        return (
            <Card style={{marginLeft: '10px', marginRight: '10px', marginTop: '20px', marginBottom: '20px', padding: '20px'}}>
                <CardHeader title={getMathJax(question.prompt)} action={<IconButton><Save/></IconButton>}/>
                {question.prompts.map((x, y) => {
                    let result = [<Divider style={{marginTop: '10px', marginBottom: '10px'}}/>];
                    result.push(this.getAnswerField(x, question.types[y], answer[y]));
                    return result;
                })}
            </Card>
        );
    }

    getAnswerField(prompt, type, answer) {
        console.log(answer);
        if (type === '2')
            return [
                getMathJax(prompt, 'body2'),
                <NumberInput prompt={prompt} answer={answer} onChange={() => {}}/>
            ];
        if (type === '8')
            return [
                getMathJax(prompt, 'body2'),
                <VectorInput prompt={prompt} answer={answer} onChange={() => {}}/>
            ];
        if (type === '6')
            return [
                getMathJax(prompt, 'body2'),
                <MatrixInput prompt={prompt} answer={answer} onChange={() => {}}/>
            ];
        return <TextField/>
    }
}