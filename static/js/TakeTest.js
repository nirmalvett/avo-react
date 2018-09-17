import React from 'react';
import Typography from '@material-ui/core/Typography/Typography';
import Grid from "@material-ui/core/Grid/Grid";
import Card from "@material-ui/core/Card/Card";
import MathJax from "react-mathjax2";
import AvoHttp from "./Http";
import Divider from "@material-ui/core/Divider/Divider";
import TextField from "@material-ui/core/TextField/TextField";

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
                </Grid>
                <Grid xs={1}/>
            </Grid>
        );
    }

    getQuestionCard(question, answer) {
        return (
            <Card style={{marginLeft: '10px', marginRight: '10px', marginTop: '20px', marginBottom: '20px', padding: '20px'}}>
                {this.getMathJax(question.prompt, 'subheading')}
                {question.prompts.map((x, y) => {
                    let result = [<Divider style={{marginTop: '10px', marginBottom: '10px'}}/>];
                    if (x !== '')
                        result.push(this.getMathJax(x, 'body2'));
                    result.push(this.getAnswerField(question.types[y], answer[y]));
                    return result;
                })}
            </Card>
        );
    }

    getAnswerField(type, answer) {
        return <TextField/>
    }

    // noinspection JSMethodCanBeStatic
    getMathJax(text, variant) {
        let strings = text.split(/\\[()]/g).map((x, y) => y % 2 === 0 ? x : <MathJax.Node inline>{x}</MathJax.Node>);
        return <MathJax.Context input='tex'><Typography variant={variant}>{strings}</Typography></MathJax.Context>
    }
}