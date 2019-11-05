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
} from '@material-ui/core';

export interface TFImporterProps {
    set: QuestionSet;
    close: () => void;
}

export interface TFImporterState {
    questionDelim: string;
    nameDelim: string;
    promptDelim: string;
    answerDelim: string;
    explanationDelim: string;
}

class TFImporter extends Component<TFImporterProps, TFImporterState> {
    constructor(props: TFImporterProps) {
        super(props);
        this.state = {
            questionDelim: '',
            nameDelim: '',
            promptDelim: '',
            answerDelim: '',
            explanationDelim: '',
        };
    }

    render() {
        return (
            <Grid container style={{padding: '20px'}} justify='space-evenly' alignContent='center' alignItems='center'>
                <Grid item xs={12} justify='center'>
                    <Typography variant='h3'>Import questions for {this.props.set.name}</Typography>
                </Grid>
                <Grid item xs={12} md={6} lg={4} justify='space-evenly'>
                    <FormControl component='fieldset'>
                        <FormLabel component='legend'>Question Delimiter</FormLabel>
                        <RadioGroup
                            aria-label='question-delim'
                            name='question-delim'
                            value={this.state.questionDelim}
                            onChange={(_, value: string) => this.setState({questionDelim: value})}
                        >
                            <ListItem>
                                {this.renderDelimRadios([[',', 'Comma'], ['|', 'Bar']])}
                            </ListItem>
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6} lg={4} justify='space-evenly'>
                    <FormControl component='fieldset'>
                        <FormLabel component='legend'>Name Delimiter</FormLabel>
                        <RadioGroup
                            aria-label='name-delim'
                            name='name-delim'
                            value={this.state.nameDelim}
                            onChange={(_, value: string) => this.setState({nameDelim: value})}
                        >
                            <ListItem>
                                <FormControlLabel
                                    value=','
                                    control={<Radio color='primary' />}
                                    label=', (comma)'
                                />
                                <FormControlLabel
                                    value='|'
                                    control={<Radio color='primary' />}
                                    label='| (bar)'
                                />
                            </ListItem>
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6} lg={4} justify='space-evenly'>
                    <FormControl component='fieldset'>
                        <FormLabel component='legend'>Prompt Delimiter</FormLabel>
                        <RadioGroup
                            aria-label='prompt-delim'
                            name='prompt-delim'
                            value={this.state.promptDelim}
                            onChange={(_, value: string) => this.setState({promptDelim: value})}
                        >
                            <ListItem>
                                <FormControlLabel
                                    value=','
                                    control={<Radio color='primary' />}
                                    label=', (comma)'
                                />
                                <FormControlLabel
                                    value='|'
                                    control={<Radio color='primary' />}
                                    label='| (bar)'
                                />
                            </ListItem>
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6} justify='space-evenly'>
                    <FormControl component='fieldset'>
                        <FormLabel component='legend'>Answer Delimiter</FormLabel>
                        <RadioGroup
                            aria-label='answer-delim'
                            name='answer-delim'
                            value={this.state.answerDelim}
                            onChange={(_, value: string) => this.setState({answerDelim: value})}
                        >
                            <ListItem>
                                <FormControlLabel
                                    value=','
                                    control={<Radio color='primary' />}
                                    label=', (comma)'
                                />
                                <FormControlLabel
                                    value='|'
                                    control={<Radio color='primary' />}
                                    label='| (bar)'
                                />
                            </ListItem>
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item xs={12} lg={6} justify='space-evenly'>
                    <FormControl component='fieldset'>
                        <FormLabel component='legend'>Explanation Delimiter</FormLabel>
                        <RadioGroup
                            aria-label='explanation-delim'
                            name='explanation-delim'
                            value={this.state.explanationDelim}
                            onChange={(_, value: string) =>
                                this.setState({explanationDelim: value})
                            }
                        >
                            <ListItem>
                                <FormControlLabel
                                    value=','
                                    control={<Radio color='primary' />}
                                    label=', (comma)'
                                />
                                <FormControlLabel
                                    value='|'
                                    control={<Radio color='primary' />}
                                    label='| (bar)'
                                />
                            </ListItem>
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item xs={12} justify='center'>
                    <List>{/* Question preview components will go here */}</List>
                </Grid>
                <Grid item xs={12}>
                    <ListItem>
                        <Button variant='contained' color='primary' style={{marginRight: '5px'}}>
                            Import
                        </Button>
                        <Button variant='outlined' onClick={this.props.close}>
                            Cancel
                        </Button>
                    </ListItem>
                </Grid>
            </Grid>
        );
    }

    renderDelimRadios(options: [string, string][]) {
        return options.map((option: [string, string]) => {
            return (
                <FormControlLabel
                    value={option[0]}
                    control={<Radio color='primary' />}
                    label={option[1]}
                />
            );
        });
    }
}

export default TFImporter;
