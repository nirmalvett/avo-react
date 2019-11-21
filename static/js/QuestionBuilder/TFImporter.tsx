import {Component} from 'react';
import {QuestionSet} from 'Http/types';
import React from 'react';

import {
    List,
    ListItem,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    Radio,
    Grid,
    Button,
    Typography,
    Divider,
    TextField,
} from '@material-ui/core';
import ImporterPreview from './ImporterPreview';
import * as Http from '../Http';
import {ShowSnackBar} from '../Layout/Layout';
import {PreviewQuestion} from './types';

export interface TFImporterProps {
    showSnackBar: ShowSnackBar;
    set: QuestionSet;
    close: () => void;
    buildQuestionString: (question: string, answer: string, explanation: string) => string;
}

export interface TFImporterState {
    input: string;
    namePromptDelim: number;
    namePromptOpts: [string, string, string];
    promptAnswerDelim: number;
    promptAnswerOpts: [string, string, string];
    answerExplanationDelim: number;
    answerExplanationOpts: [string, string, string];
}

class TFImporter extends Component<TFImporterProps, TFImporterState> {
    constructor(props: TFImporterProps) {
        super(props);
        this.state = {
            input: '',
            namePromptDelim: 0,
            namePromptOpts: ['|', '-', ''],
            promptAnswerDelim: 0,
            promptAnswerOpts: ['?', '$', ''],
            answerExplanationDelim: 0,
            answerExplanationOpts: ['/', '~', ''],
        };
    }

    render() {
        return (
            <div style={{padding: '20px'}}>
                <Typography variant='h3' align='center'>
                    Import questions for {this.props.set.name}
                </Typography>
                <TextField
                    id='raw-text-input'
                    label='Paste your questions here'
                    multiline
                    fullWidth
                    rows='4'
                    rowsMax='10'
                    margin='normal'
                    variant='outlined'
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        this.handleInput(event.target.value)
                    }
                />
                <Grid container justify='space-evenly'>
                    <Grid item xs={12} sm={6} md={4} justify='center'>
                        <FormControl component='fieldset' color='primary' style={{margin: '5px'}}>
                            <FormLabel component='legend'>Between Name and Prompt</FormLabel>
                            <RadioGroup
                                aria-label='question-delim'
                                name='question-delim'
                                value={'' + this.state.namePromptDelim}
                                onChange={(_, value: string) =>
                                    this.setState({namePromptDelim: parseInt(value)})
                                }
                            >
                                {/* 3rd element is custom delim */}
                                {this.renderDelimRadios(this.state.namePromptOpts.slice(0, 2))}
                                <FormControlLabel
                                    // 2 is the last index of the 3 possible selections for a delimiter
                                    value={'' + 2}
                                    control={<Radio color='primary' />}
                                    label={
                                        <TextField
                                            label='Custom'
                                            onChange={(
                                                event: React.ChangeEvent<HTMLInputElement>,
                                            ) =>
                                                this.setState({
                                                    namePromptOpts: [
                                                        this.state.namePromptOpts[0],
                                                        this.state.namePromptOpts[1],
                                                        event.target.value,
                                                    ],
                                                })
                                            }
                                        />
                                    }
                                />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} justify='center'>
                        <FormControl component='fieldset' style={{margin: '5px'}}>
                            <FormLabel component='legend'>Between Prompt and Answer</FormLabel>
                            <RadioGroup
                                aria-label='name-delim'
                                name='name-delim'
                                value={'' + this.state.promptAnswerDelim}
                                onChange={(_, value: string) =>
                                    this.setState({promptAnswerDelim: parseInt(value)})
                                }
                            >
                                {/* 3rd element is custom delim */}
                                {this.renderDelimRadios(this.state.promptAnswerOpts.slice(0, 2))}
                                <FormControlLabel
                                    // 2 is the last index of the 3 possible selections for a delimiter
                                    value={'' + 2}
                                    control={<Radio color='primary' />}
                                    label={
                                        <TextField
                                            label='Custom'
                                            onChange={(
                                                event: React.ChangeEvent<HTMLInputElement>,
                                            ) =>
                                                this.setState({
                                                    promptAnswerOpts: [
                                                        this.state.promptAnswerOpts[0],
                                                        this.state.promptAnswerOpts[1],
                                                        event.target.value,
                                                    ],
                                                })
                                            }
                                        />
                                    }
                                />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} justify='center'>
                        <FormControl component='fieldset' style={{margin: '5px'}}>
                            <FormLabel component='legend'>Between Answer and Explanation</FormLabel>
                            <RadioGroup
                                aria-label='prompt-delim'
                                name='prompt-delim'
                                value={'' + this.state.answerExplanationDelim}
                                onChange={(_, value: string) =>
                                    this.setState({answerExplanationDelim: parseInt(value)})
                                }
                            >
                                {/* 3rd element is custom delim */}
                                {this.renderDelimRadios(
                                    this.state.answerExplanationOpts.slice(0, 2),
                                )}
                                <FormControlLabel
                                    // 2 is the last index of the 3 possible selections for a delimiter
                                    value={'' + 2}
                                    control={<Radio color='primary' />}
                                    label={
                                        <TextField
                                            label='Custom'
                                            onChange={(
                                                event: React.ChangeEvent<HTMLInputElement>,
                                            ) =>
                                                this.setState({
                                                    answerExplanationOpts: [
                                                        this.state.answerExplanationOpts[0],
                                                        this.state.answerExplanationOpts[1],
                                                        event.target.value,
                                                    ],
                                                })
                                            }
                                        />
                                    }
                                />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                </Grid>
                <Typography variant='h6' style={{marginTop: '10px'}}>
                    Preview
                </Typography>
                <List>{this.renderQuestionPreviews()}</List>
                <ListItem>
                    <Button
                        variant='contained'
                        color='primary'
                        style={{marginRight: '5px'}}
                        onClick={this.handleImport}
                    >
                        Import
                    </Button>
                    <Button variant='outlined' color='primary' onClick={this.props.close}>
                        Cancel
                    </Button>
                </ListItem>
            </div>
        );
    }

    renderDelimRadios(options: string[]): JSX.Element[] {
        return options.map((option: string, index: number) => {
            return (
                <FormControlLabel
                    value={'' + index}
                    control={<Radio color='primary' />}
                    label={option}
                />
            );
        });
    }

    renderQuestionPreviews(): JSX.Element[] {
        const questions: PreviewQuestion[] = this.generateQuestions(this.state.input);
        return questions.map((question: PreviewQuestion) => {
            return (
                <ListItem>
                    <ImporterPreview question={question} />
                </ListItem>
            );
        });
    }

    generateQuestions = (input: String) => {
        //TODO Test and move questiongenerate into redend preview
        //Example string: Q1|The capital of Canada is? Toronto

        //array we will return at the end
        let questionArray: PreviewQuestion[] = [];
        if (input) {
            const npd = this.state.namePromptOpts[this.state.namePromptDelim];
            const pad = this.state.promptAnswerOpts[this.state.promptAnswerDelim];
            const aed = this.state.answerExplanationOpts[this.state.answerExplanationDelim];

            //selects for given strings
            let questionRegExp = new RegExp(`(.+)\\${npd}(.+)\\${pad}(.+)\\${aed}(.+)`);

            // Split on \n
            let splitArray: string[] = input.split('\n');
            // for each line, match
            splitArray.forEach(line => {
                const questionMatch = line.match(questionRegExp);
                if (questionMatch !== null) {
                    let currQuestionObj: PreviewQuestion = {
                        name: questionMatch[1],
                        prompt: questionMatch[2],
                        answer: questionMatch[3],
                        explanation: questionMatch[4],
                    };
                    questionArray.push(currQuestionObj);
                }
            });
        }
        return questionArray;
    };

    handleInput = (input: string) => {
        this.setState({input: input});
        // this.generateQuestions(input);
    };

    handleImport = () => {
        //iterate through each question in questions array
        this.generateQuestions(this.state.input).forEach((capturedQuestion: PreviewQuestion) => {
            //need to create a new question for each in array
            Http.newQuestion(
                this.props.set.setID,
                capturedQuestion.name,
                this.props.buildQuestionString(
                    capturedQuestion.prompt,
                    capturedQuestion.answer,
                    capturedQuestion.explanation,
                ),
                1,
                1,
                () => this.props.showSnackBar('success', 'Question created successfully', 2000),
                () => this.props.showSnackBar('error', 'Error creating question', 2000),
            );
        });
        //After creating all the questions, close the importer
        this.props.close();
    };
}

export default TFImporter;
