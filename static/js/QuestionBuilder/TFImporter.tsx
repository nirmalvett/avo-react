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
import {PreviewQuestion} from './types';
import ImporterPreview from './ImporterPreview';
import * as Http from '../Http';
import {ShowSnackBar} from "../Layout/Layout";

export interface TFImporterProps {
    showSnackBar: ShowSnackBar
    set: QuestionSet;
    close: () => void;
    buildQuestionString: (question: string, answer: string, explanation: string) => string
}

export interface TFImporterState {
    input: string;
    namePromptDelim: string;
    namePromptCustom: string;
    promptAnswerDelim: string;
    promptAnswerCustom: string;
    answerExplanationDelim: string;
    answerExplanationCustom: string;
    questions: PreviewQuestion[];
}

class TFImporter extends Component<TFImporterProps, TFImporterState> {
    constructor(props: TFImporterProps) {
        super(props);
        this.state = {
            input: '',
            namePromptDelim: ',',
            namePromptCustom: '',
            promptAnswerDelim: ',',
            promptAnswerCustom: '',
            answerExplanationDelim: ',',
            answerExplanationCustom: '',
            questions: []
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
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.handleInput(event.target.value)
                    }
                />
                <Grid container justify='space-evenly'>
                    <Grid item xs={12} sm={6} md={4} lg={2} justify='center'>
                        <FormControl component='fieldset' color='primary' style={{margin: '5px'}}>
                            <FormLabel component='legend'>Between Name and Prompt</FormLabel>
                            <RadioGroup
                                aria-label='question-delim'
                                name='question-delim'
                                value={this.state.namePromptDelim}
                                onChange={(_, value: string) =>
                                    this.setState({namePromptDelim: value})
                                }
                            >
                                {this.renderDelimRadios([[',', 'Comma'], ['|', 'Bar']])}
                                <FormControlLabel
                                    value={this.state.namePromptCustom}
                                    control={<Radio color='primary'/>}
                                    label={<TextField label='Custom' onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.setState({namePromptCustom: event.target.value})}/>}
                                />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2} justify='center'>
                        <FormControl component='fieldset' style={{margin: '5px'}}>
                            <FormLabel component='legend'>Between Prompt and Answer</FormLabel>
                            <RadioGroup
                                aria-label='name-delim'
                                name='name-delim'
                                value={this.state.promptAnswerDelim}
                                onChange={(_, value: string) => this.setState({promptAnswerDelim: value})}
                            >
                                {this.renderDelimRadios([[',', 'Comma'], ['|', 'Bar']])}
                                <FormControlLabel
                                    value={this.state.promptAnswerCustom}
                                    control={<Radio color='primary'/>}
                                    label={<TextField label='Custom' onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.setState({promptAnswerCustom: event.target.value})}/>}
                                />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2} justify='center'>
                        <FormControl component='fieldset' style={{margin: '5px'}}>
                            <FormLabel component='legend'>Between Answer and Explanation</FormLabel>
                            <RadioGroup
                                aria-label='prompt-delim'
                                name='prompt-delim'
                                value={this.state.answerExplanationDelim}
                                onChange={(_, value: string) => this.setState({answerExplanationDelim: value})}
                            >
                                {this.renderDelimRadios([[',', 'Comma'], ['|', 'Bar']])}
                                <FormControlLabel
                                    value={this.state.answerExplanationCustom}
                                    control={<Radio color='primary'/>}
                                    label={<TextField label='Custom' onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.setState({answerExplanationCustom: event.target.value})}/>}
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
                    <Button variant='contained' color='primary' style={{marginRight: '5px'}} onClick={this.handleImport}>
                        Import
                    </Button>
                    <Button variant='outlined' color='primary' onClick={this.props.close}>
                        Cancel
                    </Button>
                </ListItem>
            </div>
        );
    }

    renderDelimRadios(options: [string, string][]): JSX.Element[] {
        return options.map((option: [string, string]) => {
            return (
                <FormControlLabel
                    value={option[0]}
                    control={<Radio color='primary'/>}
                    label={option[1]}
                />
            );
        });
    }

    renderQuestionPreviews(): JSX.Element[] {
        return this.state.questions.map((question: PreviewQuestion) => {
            return (
                <ListItem>
                    <ImporterPreview question={question}/>
                </ListItem>
            );
        });
    }

    generateQuestions = () => {
        //TODO Test and move questiongenerate into redend preview
        //Example string: Q1|The capital of Canada is? Toronto

        //array we will return at the end
        let questionArray: PreviewQuestion[] = [];
        if (this.state.input) {
            const {
                namePromptDelim: n,
                promptAnswerDelim: p,
                answerExplanationDelim: a,
            } = this.state;

            //selects for given strings
            let questionRegExp = new RegExp(`(.+)\\${n}(.+)\\${p}(.+)\\${a}(.+)`);
            let questionMatch;

            // Split on \n
            let splitArray: string[] = this.state.input.split("\n");
            // for each line, match
            splitArray.forEach((line) => {
                const questionMatch = line.match(questionRegExp)
                if (questionMatch !== null) {
                    let currQuestionObj: PreviewQuestion = {
                        name: questionMatch[1],
                        prompt: questionMatch[2],
                        answer: questionMatch[3],
                        explanation: questionMatch[4]
                    };
                    questionArray.push(currQuestionObj)
                }
            });
        }
        this.setState({questions: questionArray});
    }

    handleInput = (input: string) => {
        this.setState({input: input});
        this.generateQuestions();
    };

    handleImport = () => {
        //iterate through each question in questions array
        this.state.questions.forEach((capturedQuestion: PreviewQuestion) => {
            //need to create a new question for each in array
            Http.newQuestion(
                this.props.set.setID,
                capturedQuestion.name,
                this.props.buildQuestionString(capturedQuestion.prompt,capturedQuestion.answer,capturedQuestion.explanation),
                1,
                1,
                () => this.props.showSnackBar('success', 'Question created successfully', 2000),
                () => this.props.showSnackBar('error', 'Error creating question', 2000),
                );
        });
        //After creating all the questions, can reset the state
        this.reset();
        this.props.close();
    };
    reset = () => {
        // Reload the default state
        this.setState({
            input: '',
            namePromptDelim: ',',
            namePromptCustom: '',
            promptAnswerDelim: ',',
            promptAnswerCustom: '',
            answerExplanationDelim: ',',
            answerExplanationCustom: '',
            questions: []
            });


    }


};

const dummyData: PreviewQuestion[] = [
    {
        name: 'Question Name',
        prompt: 'This is a prompt',
        answer: 'True',
        explanation:
            'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Voluptates assumenda eum incidunt sequi facere laudantium excepturi, corrupti reiciendis iure culpa libero laboriosam, quibusdam blanditiis aut dolorem ex ipsam ipsum harum nihil dolorum quia sapiente amet. Explicabo nam molestiae quaerat debitis a illum dolorum odit, deserunt magnam, ut blanditiis in quidem.',
    },
    {
        name: 'Question Name',
        prompt: 'This is a prompt',
        answer: 'True',
        explanation: 'This is an exlanation',
    },
    {
        name: 'Question Name',
        prompt: 'This is a prompt',
        answer: 'True',
        explanation: 'This is an exlanation',
    },
    {
        name: 'Question Name',
        prompt: 'This is a prompt',
        answer: 'True',
        explanation: 'This is an exlanation',
    },
    {
        name: 'Question Name',
        prompt: 'This is a prompt',
        answer: 'True',
        explanation: 'This is an exlanation',
    },
    {
        name: 'Question Name',
        prompt: 'This is a prompt',
        answer: 'True',
        explanation: 'This is an exlanation',
    },
    {
        name: 'Question Name',
        prompt: 'This is a prompt',
        answer: 'True',
        explanation: 'This is an exlanation',
    },
    {
        name: 'Question Name',
        prompt: 'This is a prompt',
        answer: 'True',
        explanation: 'This is an exlanation',
    },
    {
        name: 'Question Name',
        prompt: 'This is a prompt',
        answer: 'True',
        explanation: 'This is an exlanation',
    },
];

export default TFImporter;
