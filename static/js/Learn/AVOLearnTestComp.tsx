import React, {Component, ReactElement} from 'react';
import AVOMasteryGauge from './MasteryGauge';
import {Button, Grid, Grow, Icon, IconButton, Typography} from '@material-ui/core';
import * as Http from '../Http';
import {AnswerInput} from '../AnswerInput';
import AVOLearnTestCongrat from './AVOLearnTestCongrat';
import {getMathJax} from '../HelperFunctions/Utilities';
import {uniqueKey} from '../HelperFunctions/Helpers';
import {AvoLesson, AvoLessonData} from './AVOLearnComponent';
import AVOLearnIncorrectAnswerModal from './AVOLearnIncorrectAnswerModal';
type TestState = 'LESSON' | 'QUESTIONS' | 'TEST_END';

interface AVOLearnTestCompProps {
    lesson: AvoLesson & AvoLessonData;
    updateMastery: (mastery: {[conceptID: number]: number}) => void;
    theme: {
        theme: 'light' | 'dark';
        color: {
            '100': string;
            '200': string;
            '500': string;
        };
    };
    setEndTest: () => void;
    getNewQuestion: () => void;
}

interface AVOLearnTestCompState {
    questionIndex: number;
    newAnswers: string[];
    currentState: TestState;
    questionState: 0 | 1;
    currentExplanation: never[];
    explanationIndex: number;
    testEndState: 0 | 1;
    explanations: string[][];
    changedMastery: number;
    postLessonModalDisplay: 'none' | 'block';
}

export default class AVOLearnTestComp extends Component<
    AVOLearnTestCompProps,
    AVOLearnTestCompState
> {
    constructor(props: AVOLearnTestCompProps) {
        super(props);
        this.state = {
            questionIndex: 0,
            newAnswers: this.props.lesson.data.questions.map(() => ''),
            currentState: 'LESSON',
            questionState: 1,
            currentExplanation: [],
            explanationIndex: 0,
            testEndState: 0,
            explanations: this.props.lesson.data.questions.map(() => ['']),
            changedMastery: this.props.lesson.mastery,
            postLessonModalDisplay: 'none',
        };
        console.log(this);
    }

    render() {
        console.log(this.props.lesson.mastery);
        return (
            <div style={{width: '100%', position: 'relative'}}>
                <AVOLearnIncorrectAnswerModal
                    hideModal={() => this.setState({postLessonModalDisplay: 'none'})}
                    modalDisplay={this.state.postLessonModalDisplay}
                    lesson={this.props.lesson}
                />
                {this.state.currentState === 'LESSON' && (
                    <Grid container spacing={8}>
                        <Grid item xs={8}>
                            <Typography variant={'h6'}>{this.props.lesson.name}</Typography>
                            <Typography variant={'subtitle1'}>
                                {getMathJax(this.props.lesson.lesson, 'body2', uniqueKey())}
                            </Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <div
                                className={`avo-card`}
                                style={{
                                    position: 'relative',
                                    padding: '10px',
                                    flex: 1,
                                    margin: 'none',
                                    width: 'auto',
                                    display: 'flex',
                                    height: '50vh',
                                    flexDirection: 'column',
                                    border: 'none',
                                }}
                            >
                                <AVOMasteryGauge
                                    comprehension={Math.floor(this.props.lesson.mastery * 100)}
                                    theme={this.props.theme}
                                />
                            </div>
                            <Button
                                variant='outlined'
                                color='primary'
                                onClick={() => this.setState({currentState: 'QUESTIONS'})}
                                style={{float: 'right'}}
                            >
                                Practice Concept
                            </Button>
                        </Grid>
                    </Grid>
                )}
                {this.state.currentState === 'QUESTIONS' && (
                    <Grow in={true} timeout={{enter: 1000}}>
                        <Grid container spacing={8}>
                            <Grid item xs={1}>
                                <div style={{textAlign: 'center'}}>
                                    <IconButton
                                        aria-label='chevron_left'
                                        onClick={this.goToPreviousSlide}
                                        color='primary'
                                        style={{marginTop: '25vh'}}
                                    >
                                        <Icon>chevron_left</Icon>
                                    </IconButton>
                                </div>
                            </Grid>
                            <Grid item xs={10} style={{position: 'relative'}}>
                                {this.getQuestionsAndExplanations()}
                            </Grid>
                            <Grid item xs={1}>
                                <div style={{textAlign: 'center'}}>
                                    <IconButton
                                        aria-label='chevron_right'
                                        onClick={this.goToNextSlide}
                                        color='primary'
                                        style={{marginTop: '25vh'}}
                                    >
                                        <Icon>chevron_right</Icon>
                                    </IconButton>
                                </div>
                            </Grid>
                            <div style={{position: 'absolute', left: '0.25em', top: '0.25em'}}>
                                <Button
                                    onClick={() => this.setState({currentState: 'LESSON'})}
                                    variant='outlined'
                                    color='primary'
                                >
                                    Go Back To Lesson
                                </Button>
                            </div>
                        </Grid>
                    </Grow>
                )}
                {this.state.currentState === 'TEST_END' && (
                    <React.Fragment>
                        <Grow in={this.state.testEndState === 0} timeout={{enter: 1000, exit: 500}}>
                            <div style={{position: 'absolute', width: '100%'}}>
                                <div
                                    className={`avo-card`}
                                    style={{
                                        position: 'relative',
                                        padding: '10px',
                                        flex: 1,
                                        margin: 'none',
                                        width: 'auto',
                                        display: 'flex',
                                        overflow: 'hidden',
                                        height: '50vh',
                                        flexDirection: 'column',
                                        border: 'none',
                                    }}
                                >
                                    <AVOLearnTestCongrat
                                        colors={['#399103', '#039124', '#809103']}
                                    />
                                </div>
                            </div>
                        </Grow>
                        <Grow in={this.state.testEndState === 1} timeout={{enter: 1500}}>
                            <Grid container spacing={8} style={{position: 'absolute'}}>
                                <Grid item xs={8}>
                                    <Typography variant={'h6'}>{this.props.lesson.name}</Typography>
                                    <Grid container spacing={8}>
                                        <Grid item xs={2}>
                                            <div style={{textAlign: 'center'}}>
                                                <IconButton
                                                    aria-label='chevron_left'
                                                    onClick={this.goToPreviousExplanationSlide}
                                                    color='primary'
                                                    style={{marginTop: '25vh'}}
                                                >
                                                    <Icon>chevron_left</Icon>
                                                </IconButton>
                                            </div>
                                        </Grid>
                                        <Grid item xs={8} style={{position: 'relative'}}>
                                            {this.getTestEndExplanationRenderable()}
                                        </Grid>
                                        <Grid item xs={2}>
                                            <div style={{textAlign: 'center'}}>
                                                <IconButton
                                                    aria-label='chevron_right'
                                                    onClick={this.goToNextExplanationSlide}
                                                    color='primary'
                                                    style={{marginTop: '25vh'}}
                                                >
                                                    <Icon>chevron_right</Icon>
                                                </IconButton>
                                            </div>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={4}>
                                    <div
                                        className={`avo-card`}
                                        style={{
                                            position: 'relative',
                                            padding: '10px',
                                            flex: 1,
                                            margin: 'none',
                                            width: 'auto',
                                            display: 'flex',
                                            height: '50vh',
                                            flexDirection: 'column',
                                            border: 'none',
                                        }}
                                    >
                                        <AVOMasteryGauge
                                            comprehension={Math.floor(
                                                this.state.changedMastery * 100,
                                            )}
                                            theme={this.props.theme}
                                        />
                                        <Typography variant={'subtitle2'}>
                                            Mastery of {this.props.lesson.name} changed by{' '}
                                            {(
                                                (this.state.changedMastery -
                                                    this.props.lesson.mastery) *
                                                100
                                            ).toFixed(2)}
                                            %
                                        </Typography>
                                    </div>
                                </Grid>
                            </Grid>
                        </Grow>
                    </React.Fragment>
                )}
            </div>
        );
    }
    showModal = () => {
        this.setState({postLessonModalDisplay: 'block'});
    };
    goToPreviousSlide = () => {
        const currentIndex = this.state.questionIndex;
        if (currentIndex == 0) return;
        this.setState({
            questionIndex: currentIndex - 1,
            questionState: !!this.state.questionState ? 0 : 1,
        });
    };

    goToNextSlide = () => {
        const currentIndex = this.state.questionIndex;
        const {newAnswers} = this.state;
        const {questions} = this.props.lesson.data;
        console.log(questions);
        console.log(newAnswers);
        console.log(currentIndex);
        const convertedIndex = Math.floor(currentIndex / 2);
        if (currentIndex > this.props.lesson.data.questions.length * 2 - 2) {
            this.switchToTestEnd();
        } else if (
            questions[convertedIndex] &&
            newAnswers[convertedIndex] &&
            currentIndex % 2 === 0
        ) {
            console.log(convertedIndex);
            this.getExplanation(newAnswers, questions[convertedIndex], convertedIndex);
            this.setState({
                questionIndex: currentIndex + 1,
                questionState: !!this.state.questionState ? 0 : 1,
            });
        }
    };

    goToPreviousExplanationSlide = () => {
        const currentIndex = this.state.explanationIndex;
        if (currentIndex == 0) return;
        this.setState({
            explanationIndex: currentIndex - 1,
        });
    };

    goToNextExplanationSlide = () => {
        const currentIndex = this.state.explanationIndex;
        if (currentIndex > this.props.lesson.data.questions.length - 2) return;
        this.setState({
            explanationIndex: currentIndex + 1,
        });
    };

    getSlideTranslation = (index: number) => {
        if (index < this.state.questionIndex) return -75;
        if (index > this.state.questionIndex) return 75;
        return 0;
    };

    getSlideExplanationTranslation = (index: number) => {
        if (index < this.state.explanationIndex) return -75;
        if (index > this.state.explanationIndex) return 75;
        return 0;
    };

    getQuestionsAndExplanations() {
        let output: ReactElement[] = [];
        this.props.lesson.data.questions.forEach((question, index) => {
            // Question Body push
            output.push(
                <div
                    style={{
                        position: 'absolute',
                        transition: 'transform 1s ease-in, opacity 500ms ease-in',
                        opacity: !!this.getSlideTranslation(output.length) ? 0 : 1,
                        willChange: 'transform',
                        transform: `translateX(${this.getSlideTranslation(output.length)}vw)`,
                        width: '100%',
                        marginTop: '5em',
                    }}
                >
                    <div style={{textAlign: 'center'}}>
                        <AnswerInput
                            type={question.types[0]}
                            value={this.state.newAnswers[index]}
                            prompt={question.prompt}
                            onChange={value => {
                                let newAnswerList = [...this.state.newAnswers];
                                newAnswerList[index] = value;
                                this.setState({newAnswers: newAnswerList});
                            }}
                            save={value => {
                                let newAnswerList = [...this.state.newAnswers];
                                newAnswerList[index] = value;
                                this.setState({newAnswers: newAnswerList});
                                console.log(newAnswerList);
                            }}
                        />
                    </div>
                </div>,
            );

            // Explanation Push explanations
            output.push(
                <div
                    style={{
                        position: 'absolute',
                        transition: 'transform 1s ease-in, opacity 500ms ease-in',
                        opacity: !!this.getSlideTranslation(output.length) ? 0 : 1,
                        willChange: 'transform',
                        transform: `translateX(${this.getSlideTranslation(output.length)}vw)`,
                    }}
                >
                    <br />
                    <br />
                    <br />
                    {(this.state.newAnswers[index] && (
                        <div>
                            <Grid container spacing={8}>
                                <Grid item xs={8}>
                                    {this.state.explanations[index].map(x => getMathJax(x))}
                                </Grid>
                                <Grid item xs={4}>
                                    <div
                                        className={`avo-card`}
                                        style={{
                                            position: 'relative',
                                            padding: '10px',
                                            flex: 1,
                                            margin: 'none',
                                            width: 'auto',
                                            display: 'flex',
                                            height: '50vh',
                                            flexDirection: 'column',
                                            border: 'none',
                                        }}
                                    >
                                        <AVOMasteryGauge
                                            comprehension={Math.floor(
                                                this.state.changedMastery * 100,
                                            )}
                                            theme={this.props.theme}
                                        />
                                        <Typography variant={'subtitle2'}>
                                            Mastery of {this.props.lesson.name} changed by{' '}
                                            {(
                                                (this.state.changedMastery -
                                                    this.props.lesson.mastery) *
                                                100
                                            ).toFixed(2)}
                                            %
                                        </Typography>
                                    </div>
                                </Grid>
                                <Grid container xs={12}>
                                    <Button
                                        variant='outlined'
                                        color='primary'
                                        onClick={() => {
                                            this.setState({
                                                questionIndex: 0,
                                                newAnswers: this.props.lesson.data.questions.map(
                                                    () => '',
                                                ),
                                            });
                                            this.props.getNewQuestion();
                                        }}
                                        style={{marginLeft: 'auto', marginRight: 15}}
                                    >
                                        Practice Concept
                                    </Button>
                                    <Button
                                        variant='outlined'
                                        color='primary'
                                        onClick={() => this.switchToTestEnd()}
                                    >
                                        Finish concept for now
                                    </Button>
                                </Grid>
                            </Grid>
                        </div>
                    )) ||
                        (!this.state.newAnswers[index] && (
                            <div>
                                {/* <Typography variant={'h6'}>
                                    Previous Question is missing an answer, therefore no explanation
                                    is available.
                                </Typography> */}
                            </div>
                        ))}
                </div>,
            );
        });
        return output;
    }

    getTestEndExplanationRenderable() {
        const output: ReactElement[] = [];
        this.props.lesson.data.questions.forEach((question, index) => {
            output.push(
                <div
                    style={{
                        position: 'absolute',
                        transition: 'transform 1s ease-in, opacity 500ms ease-in',
                        opacity: !!this.getSlideExplanationTranslation(index) ? 0 : 1,
                        willChange: 'transform',
                        transform: `translateX(${this.getSlideExplanationTranslation(index)}vw)`,
                        height: '75vh',
                        overflowY: 'auto',
                    }}
                >
                    <br />
                    <br />
                    <div style={{textAlign: 'center'}}>
                        <AnswerInput
                            type={question.types[0]}
                            value={this.state.newAnswers[index]}
                            prompt={question.prompt}
                            disabled={true}
                            onChange={() => {}}
                            save={() => {}}
                        />
                    </div>
                    <br />
                    {(this.state.newAnswers[index] && (
                        <div>
                            {this.state.explanations[index].map(x => getMathJax(x))}
                        </div>
                    )) ||
                        (!this.state.newAnswers[index] && (
                            <div>
                                <Typography variant='h6'>
                                    This Question is missing an answer, therefore no explanation is
                                    available.
                                </Typography>
                            </div>
                        ))}
                </div>,
            );
        });
        return output;
    }

    getExplanation(answers: string[], question: {ID: number; seed: number}, index: number) {
        console.log(answers);
        console.log(question);
        console.log(this.props.lesson);
        Http.submitQuestion(
            question.ID,
            question.seed,
            [answers[index]],
            res => {
                console.log(res);
                if (res.points[0] / res.totals[0] < 0.5) this.showModal();
                const temp = this.state.explanations;
                temp[index] = res.explanation;
                const changedMastery = res.mastery[this.props.lesson.conceptID] || 0
                this.setState({explanations: temp, changedMastery}, () =>
                    this.props.updateMastery(res.mastery),
                );
            },
            err => {
                console.log(err);
            },
        );
    }

    switchToTestEnd() {
        this.setState({currentState: 'TEST_END'});
        setTimeout(() => {
            this.setState({testEndState: 1});
            this.props.setEndTest();
        }, 3000);
    }
}
