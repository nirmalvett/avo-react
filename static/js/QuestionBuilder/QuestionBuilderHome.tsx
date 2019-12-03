import React, {Component} from 'react';
import {Button, Card, Grid, Grow, Typography} from '@material-ui/core';
import Logo from '../SharedComponents/Logo';
import MultipleChoiceBuilder from './MultipleChoiceBuilder';
import QuestionManager from './QuestionManager';
import TrueFalseBuilder from './TrueFalseBuilder';
import {QuestionSet, Course} from 'Http/types';
import {ShowSnackBar} from 'Layout/Layout';
import {QuestionBuilder} from './QuestionBuilder';

interface Mode1 {
    mode: null;
}

interface Mode2 {
    mode: 'set';
    s: number;
}

interface Mode3 {
    mode: 'question';
    s: number;
    q: number;
}

export type QuestionBuilderSelection = Mode1 | Mode2 | Mode3;

type QuestionBuilderHomeProps = {
    sets: QuestionSet[];
    updateSets: (questionSets: QuestionSet[], cb?: () => void) => void;
    showSnackBar: ShowSnackBar;
    courses: Course[];
    theme: 'light' | 'dark';
};

interface QuestionBuilderHomeState {
    screen: 'home' | 'math' | 'math-builder' | 'multiple-choice' | 'true-false';
    selection: QuestionBuilderSelection;
    isActive: boolean;
}

export class QuestionBuilderHome extends Component<
    QuestionBuilderHomeProps,
    QuestionBuilderHomeState
> {
    constructor(props: QuestionBuilderHomeProps) {
        super(props);
        this.state = {
            screen: 'home',
            selection: {mode: null},
            isActive: false,
        };
    }

    render() {
        switch (this.state.screen) {
            case 'home':
                return this.renderHomeScreen();
            case 'math':
                return (
                    <QuestionManager
                        returnHome={this.returnHome}
                        deselect={this.deselect}
                        selectSet={this.selectSet}
                        selectQuestion={this.selectQuestion}
                        showSnackBar={this.props.showSnackBar}
                        initBuilder={() => this.setState({screen: 'math-builder'})}
                        selection={this.state.selection}
                        sets={this.props.sets}
                        courses={this.props.courses}
                        updateSets={this.props.updateSets}
                    />
                );
            case 'math-builder':
                if (this.state.selection.mode !== 'question') return null;
                return (
                    <QuestionBuilder
                        back={() => this.setState({screen: 'math'})}
                        updateSets={this.props.updateSets}
                        showSnackBar={this.props.showSnackBar}
                        s={this.state.selection.s}
                        q={this.state.selection.q}
                        sets={this.props.sets}
                    />
                );
            case 'multiple-choice':
                return (
                    <MultipleChoiceBuilder
                        sets={this.props.sets}
                        courses={this.props.courses}
                        returnHome={() => this.setState({screen: 'home', isActive: true})}
                        updateSets={this.props.updateSets}
                        showSnackBar={this.props.showSnackBar}
                    />
                );
            case 'true-false':
                return (
                    <TrueFalseBuilder
                        sets={this.props.sets}
                        courses={this.props.courses}
                        returnHome={() => this.setState({screen: 'home', isActive: true})}
                        showSnackBar={this.props.showSnackBar}
                        updateSets={this.props.updateSets}
                    />
                );
            default:
                return this.renderHomeScreen();
        }
    }

    renderHomeScreen() {
        return (
            <Grid style={{overflow: 'auto'}} container xs={12}>
                <Grid item xs={3} />
                <Grid item xs={6}>
                    <Grow in={this.state.isActive}>
                        <Card
                            className='avo-card'
                            style={{
                                height: 'auto',
                                width: 'auto',
                                maxHeight: '100%',
                            }}
                        >
                            <Logo
                                theme={this.props.theme}
                                style={{width: '80%', marginLeft: '10%', marginTop: '5%'}}
                            />
                            <Typography variant='h4' gutterBottom>
                                Question Builder
                            </Typography>
                            <Typography variant='subtitle1' gutterBottom>
                                What type of question would you like to create today?
                            </Typography>
                            <br />
                            <Button
                                onClick={this.switchToMathQB}
                                variant='outlined'
                                color='primary'
                                className=''
                                style={{
                                    width: '90%',
                                    borderRadius: '2.5em',
                                    margin: '5%',
                                    marginBottom: '0px',
                                }}
                            >
                                Math
                            </Button>
                            <br />
                            <Button
                                onClick={this.switchToMCB}
                                variant='outlined'
                                color='primary'
                                className=''
                                style={{
                                    width: '90%',
                                    borderRadius: '2.5em',
                                    margin: '5%',
                                    marginBottom: '0px',
                                }}
                            >
                                Multiple choice
                            </Button>
                            <br />
                            <Button
                                onClick={this.switchToTF}
                                variant='outlined'
                                color='primary'
                                className=''
                                style={{width: '90%', borderRadius: '2.5em', margin: '5%'}}
                            >
                                True or False
                            </Button>
                        </Card>
                    </Grow>
                </Grid>
                <Grid item xs={3} />
            </Grid>
        );
    }

    componentDidMount() {
        this.setState({isActive: true});
    }

    switchToMathQB = () => {
        this.setState({isActive: false}, () =>
            setTimeout(() => this.setState({screen: 'math'}), 500),
        );
    };

    switchToMCB = () => {
        this.setState({isActive: false}, () =>
            setTimeout(() => this.setState({screen: 'multiple-choice'}), 500),
        );
    };

    switchToTF = () => {
        this.setState({isActive: false}, () =>
            setTimeout(() => this.setState({screen: 'true-false'}), 500),
        );
    };

    returnHome = () => {
        this.setState({screen: 'home'}, () =>
            setTimeout(() => this.setState({isActive: true}), 500),
        );
    };

    deselect = () => this.setState({selection: {mode: null}});

    selectSet = (s: number) => () => this.setState({selection: {mode: 'set', s}});

    selectQuestion = (s: number, q: number) => () =>
        this.setState({selection: {mode: 'question', s, q}});
}
