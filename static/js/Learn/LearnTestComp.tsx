import React, {Component, Fragment, ReactElement} from 'react';
import AVOMasteryGauge from './MasteryGauge';
import {Button, Grid, Grow, Typography} from '@material-ui/core';
import * as Http from '../Http';
import {AnswerInput} from '../AnswerInput';
import AVOLearnTestCongrat from './AVOLearnTestCongrat';
import {getMathJax} from '../HelperFunctions/Utilities';
import {AvoLesson, AvoLessonData} from './AVOLearnComponent';
import AVOLearnIncorrectAnswerModal from './AVOLearnIncorrectAnswerModal';
import {ThemeObj} from "../Models";

interface LearnTestCompProps {
    lesson: AvoLesson;
    updateMastery: (mastery: {[conceptID: number]: number}) => void;
    theme: ThemeObj;
}

interface LearnTestCompState {
    mode: 'lesson' | 'question' | 'explanation' | 'finish';
    readonly questions: AvoLessonData[];
    readonly explanations: Http.SubmitQuestion[];
    nextQuestion: AvoLessonData | undefined;
    readonly newAnswers: string[];

    explanationIndex: number;
    testEndState: 0 | 1;
    changedMastery: number;
    postLessonModalDisplay: 'none' | 'block';
}

export default class LearnTestComp extends Component<LearnTestCompProps, LearnTestCompState> {
    constructor(props: LearnTestCompProps) {
        super(props);
        this.state = {
            mode: 'lesson',
            questions: [],
            explanations: [],
            nextQuestion: undefined,

            newAnswers: [],
            explanationIndex: 0,
            testEndState: 0,
            changedMastery: this.props.lesson.mastery,
            postLessonModalDisplay: 'none',
        };
    }

    componentDidMount() {
        this.getQuestion();
    }

    getQuestion() {
        Http.getNextQuestion(
            this.props.lesson.conceptID,
            nextQuestion => this.setState({nextQuestion, newAnswers: nextQuestion.prompts.map(() => '')}),
            console.warn,
        );
    }

    render() {
        return (
            <div style={{width: '95%', position: 'relative'}}>
                <AVOLearnIncorrectAnswerModal
                    hideModal={() => this.setState({postLessonModalDisplay: 'none'})}
                    modalDisplay={this.state.postLessonModalDisplay}
                    lesson={this.props.lesson}
                    questionID={(this.state.nextQuestion || {ID: 0}).ID}
                />
                {this.getContent()}
            </div>
        );
    }

    getContent(): ReactElement {
        switch (this.state.mode) {
            case 'lesson':
                return this.renderLesson();
            case 'question':
                return this.renderQuestion();
            case 'explanation':
                return this.renderExplanation();
            case 'finish':
                return this.renderFinish();
        }
    }

    renderLesson() {
        return (
            <Grid container spacing={8}>
                <Grid item xs={8}>
                    <Typography variant={'h6'}>{this.props.lesson.name}</Typography>
                    <Typography variant={'subtitle1'}>
                        {getMathJax(this.props.lesson.lesson, 'body2')}
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
                        disabled={!this.state.nextQuestion}
                        onClick={this.goToQuestion}
                        style={{float: 'right'}}
                    >
                        Practice Concept
                    </Button>
                </Grid>
            </Grid>
        );
    }

    goToQuestion = () => this.setState({mode: 'question'});

    renderQuestion() {
        const question = this.state.nextQuestion as AvoLessonData;
        return (
            <Grow in={true} timeout={{enter: 1000}}>
                <Grid container spacing={8}>
                    <Grid item xs={1}/>
                    <Grid item xs={10} style={{position: 'relative'}}>
                        <div
                            style={{
                                position: 'absolute',
                                transition: 'transform 1s ease-in, opacity 500ms ease-in',
                                willChange: 'transform',
                                width: '100%',
                                marginTop: '5em',
                            }}
                        >
                            <div style={{textAlign: 'center'}}>
                                {getMathJax(question.prompt)}
                                {question.prompts.map((p, idx) => (
                                    <>
                                        <br />
                                        <br />
                                        <div style={{textAlign: 'center'}}>
                                            <AnswerInput
                                                type={question.types[idx]}
                                                value={this.state.newAnswers[idx]}
                                                prompt={p}
                                                onChange={this.changeAnswer(idx)}
                                                save={this.changeAnswer(idx)}
                                            />
                                        </div>
                                    </>
                                ))}
                            </div>
                            <div style={{position: 'absolute', right: '4px', bottom: '4px'}}>
                                <Button onClick={this.submitAnswer} variant='outlined' color='primary'>
                                    Submit Answer
                                </Button>
                            </div>
                        </div>
                    </Grid>
                    <Grid item xs={1}/>
                    <div style={{position: 'absolute', left: '4px', top: '4px'}}>
                        <Button
                            onClick={() => this.setState({mode: 'lesson'})}
                            variant='outlined'
                            color='primary'
                        >
                            Go Back To Lesson
                        </Button>
                    </div>
                </Grid>
            </Grow>
        );
    }

    renderExplanation() {
        const explanation = this.state.explanations[this.state.explanations.length - 1];
        return (
            <div
                style={{
                    position: 'absolute',
                    transition: 'transform 1s ease-in, opacity 500ms ease-in',
                    willChange: 'transform',
                }}
            >
                <br />
                <br />
                <br />
                {(
                    <div>
                        <Grid container spacing={8}>
                            <Grid item xs={8}>
                                {explanation.explanation.map(x => getMathJax(x))}
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
                                    onClick={this.goToQuestion}
                                    style={{marginLeft: 'auto', marginRight: 15}}
                                    disabled={!this.state.nextQuestion}
                                >
                                    Practice Concept
                                </Button>
                                <Button
                                    variant='outlined'
                                    color='primary'
                                    onClick={() => this.setState({mode: 'finish'})}
                                >
                                    Finish concept for now
                                </Button>
                            </Grid>
                        </Grid>
                    </div>
                )}
            </div>
        );
    }

    renderFinish() {
        return (
            <Fragment>
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
                                <Grid item xs={12} style={{position: 'relative'}}>
                                    {this.getTestEndExplanationRenderable()}
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
                                <Typography variant={'body2'}>
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
            </Fragment>
        );
    }

    showModal = () => {
        this.setState({postLessonModalDisplay: 'block'});
    };

    submitAnswer = () => {
        const question = this.state.nextQuestion as AvoLessonData;
        Http.submitQuestion(
            question.ID,
            question.seed,
            this.state.newAnswers,
            res => {
                if (res.points.reduce((x, y) => x+y, 0) / res.totals.reduce((x, y) => x+y, 0) < 0.5) {
                    this.showModal();
                }
                const questions = [...this.state.questions, question];
                const explanations = [...this.state.explanations, res];
                const changedMastery = res.mastery[this.props.lesson.conceptID] || 0;
                this.setState(
                    {questions, explanations, changedMastery, nextQuestion: undefined, mode: 'explanation'},
                    () => {
                        this.props.updateMastery(res.mastery);
                        this.getQuestion();
                    }
                );
            },
            console.warn,
        );
    };

    getSlideExplanationTranslation = (index: number) => {
        if (index < this.state.explanationIndex) return -75;
        if (index > this.state.explanationIndex) return 75;
        return 0;
    };

    changeAnswer(index: number) {
        return (answer: string) => {
            const newAnswerList = [...this.state.newAnswers];
            newAnswerList[index] = answer;
            this.setState({newAnswers: newAnswerList});
        };
    }

    getTestEndExplanationRenderable() {
        return this.state.questions.map((question, index) => {
            return (
                <div
                    style={{
                        position: 'absolute',
                        transition: 'transform 1s ease-in, opacity 500ms ease-in',
                        opacity: this.getSlideExplanationTranslation(index) ? 0 : 1,
                        willChange: 'transform',
                        transform: `translateX(${this.getSlideExplanationTranslation(index)}vw)`,
                        height: '75vh',
                        overflowY: 'auto',
                    }}
                >
                    {getMathJax(question.prompt)}
                    {question.prompts.map((p, idx) => (
                        <>
                            <br />
                            <br />
                            <div style={{textAlign: 'center'}}>
                                <AnswerInput
                                    type={question.types[idx]}
                                    value={this.state.newAnswers[idx]}
                                    prompt={p}
                                    disabled={true}
                                    onChange={() => {}}
                                    save={() => {}}
                                />
                            </div>
                        </>
                    ))}
                    <br />
                    {(this.state.newAnswers[index] && (
                        <div>{this.state.explanations[index].explanation.map(x => getMathJax(x))}</div>
                    )) ||
                        (!this.state.newAnswers[index] && (
                            <div>
                                <Typography variant='h6'>
                                    This Question is missing an answer, therefore no explanation is
                                    available.
                                </Typography>
                            </div>
                        ))}
                </div>
            );
        });
    }
}
