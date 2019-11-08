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

export interface TFImporterProps {
    set: QuestionSet;
    close: () => void;
    buildQuestionString: (question: string, answer: string, explanation: string)
}

export interface TFImporterState {
    input: string;
    questionDelim: string;
    questionCustom: string;
    nameDelim: string;
    nameCustom: string;
    promptDelim: string;
    promptCustom: string;
    answerDelim: string;
    answerCustom: string;
    explanationDelim: string;
    explanationCustom: string;
    questions: PreviewQuestion[];
}

class TFImporter extends Component<TFImporterProps, TFImporterState> {
    constructor(props: TFImporterProps) {
        super(props);
        this.state = {
            input: '',
            questionDelim: ',',
            questionCustom: '',
            nameDelim: ',',
            nameCustom: '',
            promptDelim: ',',
            promptCustom: '',
            answerDelim: ',',
            answerCustom: '',
            explanationDelim: ',',
            explanationCustom: '',
            // questions: [],
            questions: this.generateQuestions(this.state.input, this.state.nameDelim, this.state.promptDelim, this.state.answerDelim, this.state.explanationDelim, this.state.questionDelim),
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
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.generateQuestions()
                    }
                />
                <Grid container justify='space-evenly'>
                    <Grid item xs={12} sm={6} md={4} lg={2} justify='center'>
                        <FormControl component='fieldset' color='primary' style={{margin: '5px'}}>
                            <FormLabel component='legend'>Question Delimiter</FormLabel>
                            <RadioGroup
                                aria-label='question-delim'
                                name='question-delim'
                                value={this.state.questionDelim}
                                onChange={(_, value: string) =>
                                    this.setState({questionDelim: value})
                                }
                            >
                                {this.renderDelimRadios([[',', 'Comma'], ['|', 'Bar']])}
                                <FormControlLabel
                                    value={this.state.questionCustom}
                                    control={<Radio color='primary'/>}
                                    label={<TextField label='Custom'/>}
                                />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2} justify='center'>
                        <FormControl component='fieldset' style={{margin: '5px'}}>
                            <FormLabel component='legend'>Name Delimiter</FormLabel>
                            <RadioGroup
                                aria-label='name-delim'
                                name='name-delim'
                                value={this.state.nameDelim}
                                onChange={(_, value: string) => this.setState({nameDelim: value})}
                            >
                                {this.renderDelimRadios([[',', 'Comma'], ['|', 'Bar']])}
                                <FormControlLabel
                                    value={this.state.nameCustom}
                                    control={<Radio color='primary'/>}
                                    label={<TextField label='Custom'></TextField>}
                                />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2} justify='center'>
                        <FormControl component='fieldset' style={{margin: '5px'}}>
                            <FormLabel component='legend'>Prompt Delimiter</FormLabel>
                            <RadioGroup
                                aria-label='prompt-delim'
                                name='prompt-delim'
                                value={this.state.promptDelim}
                                onChange={(_, value: string) => this.setState({promptDelim: value})}
                            >
                                {this.renderDelimRadios([[',', 'Comma'], ['|', 'Bar']])}
                                <FormControlLabel
                                    value={this.state.promptCustom}
                                    control={<Radio color='primary'/>}
                                    label={<TextField label='Custom'></TextField>}
                                />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2} justify='center'>
                        <FormControl component='fieldset' style={{margin: '5px'}}>
                            <FormLabel component='legend'>Answer Delimiter</FormLabel>
                            <RadioGroup
                                aria-label='answer-delim'
                                name='answer-delim'
                                value={this.state.answerDelim}
                                onChange={(_, value: string) => this.setState({answerDelim: value})}
                            >
                                {this.renderDelimRadios([[',', 'Comma'], ['|', 'Bar']])}
                                <FormControlLabel
                                    value={this.state.answerCustom}
                                    control={<Radio color='primary'/>}
                                    label={<TextField label='Custom'></TextField>}
                                />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2} justify='center'>
                        <FormControl component='fieldset' style={{margin: '5px'}}>
                            <FormLabel component='legend'>Explanation Delimiter</FormLabel>
                            <RadioGroup
                                aria-label='explanation-delim'
                                name='explanation-delim'
                                value={this.state.explanationDelim}
                                onChange={(_, value: string) =>
                                    this.setState({explanationDelim: value})
                                }
                            >
                                {this.renderDelimRadios([[',', 'Comma'], ['|', 'Bar']])}
                                <FormControlLabel
                                    value={this.state.answerCustom}
                                    control={<Radio color='primary'/>}
                                    label={<TextField label='Custom'></TextField>}
                                />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                </Grid>
                <Typography variant='h6' style={{marginTop: '10px'}}>
                    Preview
                </Typography>
                <List>{this.renderQuestionPreviews(this.state.questions)}</List>
                <ListItem>
                    <Button variant='contained' color='primary' style={{marginRight: '5px'}}>
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

    renderQuestionPreviews(questions: PreviewQuestion[]): JSX.Element[] {
        return questions.map((question: PreviewQuestion) => {
            return (
                <ListItem>
                    <ImporterPreview question={question}/>
                </ListItem>
            );
        });
    }

    generateQuestions(input?: string, nDelim?: string, pDelim?: string, aDelim?: string, eDelim?: string, qDelim?: string): PreviewQuestion[] {
        let questionArray = []
        if (input) {
            //array we will return at the end

            //selects for given strings
            let questionRegExp = new RegExp("(.+)\\" + nDelim + "(.+)\\" + pDelim + "(.+)\\" + aDelim + "(.+)\\" + eDelim + "(.+)//" + qDelim, "g");
            let questionMatch;

            //Look through all matches of regex
            while (questionMatch = questionRegExp.exec(input)) {
                //put the current items in an object
                let currQuestionObj = {
                    name: questionMatch[1],
                    prompt: questionMatch[2],
                    answer: questionMatch[3],
                    explanation: questionMatch[4]
                    }
                //append current object to an array
                questionArray.push(currQuestionObj)
            }
        }
        return questionArray;
    }
}

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
