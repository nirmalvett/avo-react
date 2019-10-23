import React, {Component} from 'react';
import {Button, Card, Grid, Grow, Typography} from '@material-ui/core';
import Logo from '../SharedComponents/Logo';
import MultipleChoiceBuilder from './MultipleChoiceBuilder';
import QuestionManager from '../CourseBuilder/QuestionBuilder/QuestionManager';
import TrueFalseBuilder from './TrueFalseBuilder';
import {QuestionSet, Course} from 'Http/types';
import {ShowSnackBar} from 'Layout/Layout';

interface QuestionBuilderHomeState {
    mode: 'home' | 'math' | 'multiple-choice' | 'true-false';
    isActive: boolean;
}

type QuestionBuilderHomeProps = {
    s: number | null;
    q: number | null;
    sets: QuestionSet[];
    initBuilder: (s: number, q: number, sets: QuestionSet[]) => void;
    showSnackBar: ShowSnackBar;
    courses: Course[];
    theme: 'light' | 'dark';
};

export class QuestionBuilderHome extends Component<
    QuestionBuilderHomeProps,
    QuestionBuilderHomeState
> {
    constructor(props: QuestionBuilderHomeProps) {
        super(props);
        this.state = {
            mode: 'home',
            isActive: false,
        };
    }

    render() {
        switch (this.state.mode) {
            case 'home':
                return this.renderHomeScreen();
            case 'math':
                return (
                    <QuestionManager
                        returnHome={() => this.setState({mode: 'home', isActive: true})}
                        showSnackBar={this.props.showSnackBar}
                        initBuilder={this.props.initBuilder}
                        s={this.props.s}
                        q={this.props.q}
                        sets={this.props.sets}
                        courses={this.props.courses}
                    />
                );
            case 'multiple-choice':
                return (
                    <MultipleChoiceBuilder
                        sets={this.props.sets}
                        courses={this.props.courses}
                        returnHome={() => this.setState({mode: 'home', isActive: true})}
                        showSnackBar={this.props.showSnackBar}
                    />
                );
            case 'true-false':
                return (
                    <TrueFalseBuilder
                        sets={this.props.sets}
                        courses={this.props.courses}
                        returnHome={() => this.setState({mode: 'home', isActive: true})}
                        showSnackBar={this.props.showSnackBar}
                    />
                );
            default:
                return this.renderHomeScreen();
        }
    }

    renderHomeScreen() {
        return (
            <Grid container xs={12}>
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
                                onClick={this.switchToMathQB.bind(this)}
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
                                onClick={this.switchToMCB.bind(this)}
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
                                onClick={this.switchToTF.bind(this)}
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

    switchToMathQB() {
        this.setState({isActive: false});
        setTimeout(() => {
            this.setState({mode: 'math'});
        }, 500);
    }

    switchToMCB() {
        this.setState({isActive: false});
        setTimeout(() => {
            this.setState({mode: 'multiple-choice'});
        }, 500);
    }

    switchToTF() {
        this.setState({isActive: false});
        setTimeout(() => {
            this.setState({mode: 'true-false'});
        }, 500);
    }
}
