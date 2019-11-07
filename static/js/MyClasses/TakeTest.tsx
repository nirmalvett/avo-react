import React, {Component} from 'react';
import * as Http from '../Http';
import {arrayEq} from '../HelperFunctions/Utilities';
import {AnswerInput} from '../AnswerInput';
import {
    Button,
    Card,
    CardHeader,
    Divider,
    IconButton,
    Tooltip,
    Typography,
} from '@material-ui/core';
import Save from '@material-ui/icons/Save';
import {ShowSnackBar} from '../Layout/Layout';
import {Content} from '../HelperFunctions/Content';

interface TakeTestProps {
    showSnackBar: ShowSnackBar;
    test: Http.GetTest;
    submitTest: (takes: number) => void;
}

export interface TakeTestState {
    answers: string[][];
    newAnswers: string[][];
}

interface Question {
    prompt: string;
    prompts: string[];
    types: string[];
}

export default class TakeTest extends Component<TakeTestProps, TakeTestState> {
    constructor(props: TakeTestProps) {
        super(props);
        // todo: props shouldn't be copied into state
        this.state = {
            answers: this.props.test.answers,
            newAnswers: this.props.test.answers,
        };
    }

    render() {
        return (
            <div style={{flex: 1, padding: '20px 10%', overflowY: 'auto'}}>
                <Card
                    style={{
                        marginLeft: '10px',
                        marginRight: '10px',
                        marginTop: '20px',
                        marginBottom: '20px',
                        padding: '20px',
                    }}
                >
                    {/*<CardHeader title={testName}/>*/}
                    <Typography>
                        If you run into any issues please email <a>contact@avocadocore.com</a>. Our
                        team will be quick to respond and assist you.
                    </Typography>
                </Card>
                {this.props.test.questions.map(this.getQuestionCard)}
                <div
                    style={{
                        marginLeft: '10px',
                        marginRight: '10px',
                        marginTop: '20px',
                        marginBottom: '20px',
                    }}
                >
                    <Button
                        color='primary'
                        variant='contained'
                        style={{width: '100%', color: 'white'}}
                        id='avo-test__submit-button'
                        onClick={this.submitTest}
                    >
                        Submit Test
                    </Button>
                </div>
            </div>
        );
    }

    getQuestionCard = (question: Question, index: number) => {
        const disabled: boolean =
            JSON.stringify(this.state.newAnswers[index]) ===
            JSON.stringify(this.state.answers[index]);
        return (
            <Card style={{margin: '20px 10px', padding: '20px'}}>
                <CardHeader
                    title={<Content>{`${index + 1}. ${question.prompt}`}</Content>}
                    action={
                        disabled ? (
                            <Tooltip title='Nothing to save'>
                                <span>
                                    <IconButton disabled>
                                        <Save />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        ) : (
                            <IconButton onClick={this.saveAnswer(index)} color='primary'>
                                <Save />
                            </IconButton>
                        )
                    }
                />
                {question.prompts.map((prompt: string, promptIndex: number) => [
                    <Divider style={{marginTop: '10px', marginBottom: '10px'}} />,
                    <AnswerInput
                        prompt={prompt}
                        type={question.types[promptIndex]}
                        value={this.state.newAnswers[index][promptIndex]}
                        onChange={this.onChange(index, promptIndex)}
                        save={this.save(index, promptIndex)}
                        showSnackBar={this.props.showSnackBar}
                    />,
                ])}
            </Card>
        );
    };

    onChange = (index1: number, index2: number) => (value: string) => {
        if (this.state.newAnswers[index1][index2] === value) return;
        console.debug('update', index1, index2, value);
        const newAnswers = [...this.state.newAnswers];
        newAnswers[index1] = [...newAnswers[index1]];
        newAnswers[index1][index2] = value;
        this.setState({newAnswers});
    };

    save = (index1: number, index2: number) => (value: string) => {
        console.debug('save', index1, index2, value);
        const newAnswers = [...this.state.newAnswers];
        newAnswers[index1] = [...newAnswers[index1]];
        newAnswers[index1][index2] = value;
        this.setState({newAnswers}, this.saveAnswer(index1));
    };

    saveAnswer = (index: number) => () => {
        if (arrayEq(this.state.answers[index], this.state.newAnswers[index])) return;
        Http.saveAnswer(
            this.props.test.takes,
            index,
            this.state.newAnswers[index],
            this.onSave(index, this.state.newAnswers[index]),
            this.onSaveError,
        );
    };

    onSave = (index: number, answer: string[]) => () => {
        const answers = [...this.state.answers];
        answers[index] = answer;
        this.setState({answers});
    };

    onSaveError = () => this.props.showSnackBar('error', "Couldn't save answer", 2000);

    submitTest = () => {
        Http.submitTest(
            this.props.test.takes,
            () => this.props.submitTest(this.props.test.takes),
            () => alert('Something went wrong'),
        );
    };
}
