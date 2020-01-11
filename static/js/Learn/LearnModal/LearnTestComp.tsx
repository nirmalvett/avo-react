import React, {Component, Fragment, ReactElement} from 'react';
import * as Http from '../../Http';
import {AvoLesson, AvoLessonData} from '../Learn';
import AVOLearnIncorrectAnswerModal from '../AVOLearnIncorrectAnswerModal';
import {ThemeObj} from '../../Models';
import {LessonScreen} from './LessonScreen';
import {QuestionScreen} from './QuestionScreen';
import {ExplanationScreen} from './ExplanationScreen';
import {FinishScreen} from './FinishScreen';
import {ShowSnackBar, SnackbarVariant} from "../../Layout/Layout";

interface LearnTestCompProps {
    lesson: AvoLesson;
    updateMastery: (mastery: { [conceptID: number]: number }) => void;
    theme: ThemeObj;
    survey: (mastery: number, aptitude: number) => () => void;
    showSnackBar: ShowSnackBar;
}

interface LearnTestCompState {
    mode: 'lesson' | 'question' | 'explanation' | 'finish';

    readonly questions: AvoLessonData[];
    readonly answers: string[][];
    readonly explanations: Http.SubmitQuestion[];

    nextQuestion: AvoLessonData | undefined;
    readonly nextAnswers: string[];

    changedMastery: number;
    incorrectAnswerModalDisplay: 'none' | 'block';
}

export default class LearnTestComp extends Component<LearnTestCompProps, LearnTestCompState> {
    constructor(props: LearnTestCompProps) {
        super(props);
        this.state = {
            mode: 'lesson',

            questions: [],
            answers: [],
            explanations: [],

            nextQuestion: undefined,
            nextAnswers: [],

            changedMastery: this.props.lesson.mastery,
            incorrectAnswerModalDisplay: 'none',
        };
    }

    componentDidMount() {
        this.getQuestion();
    }

    getQuestion() {
        Http.getNextQuestion(
            this.props.lesson.conceptID,
            nextQuestion =>
                this.setState({nextQuestion, nextAnswers: nextQuestion.prompts.map(() => '')}),
            console.warn,
        );
    }

    render() {
        return (
            <Fragment>
                <AVOLearnIncorrectAnswerModal
                    hideModal={() => this.setState({incorrectAnswerModalDisplay: 'none'})}
                    modalDisplay={this.state.incorrectAnswerModalDisplay}
                    lesson={this.props.lesson as AvoLesson}
                    question={this.state.nextQuestion}
                />
                {this.getContent()}
            </Fragment>
        );
    }

    getContent(): ReactElement {
        switch (this.state.mode) {
            case 'lesson':
                return (
                    <LessonScreen
                        lesson={this.props.lesson}
                        disabled={!this.state.nextQuestion}
                        theme={this.props.theme}
                        next={this.goToQuestion}
                        survey={this.props.survey}
                        showSnackBar={this.props.showSnackBar}
                    />
                );
            case 'question':
                return (
                    <QuestionScreen
                        question={this.state.nextQuestion as AvoLessonData}
                        answers={this.state.nextAnswers}
                        changeAnswer={this.changeAnswer}
                        back={this.backFromQuestion}
                        next={this.submitAnswer}
                    />
                );
            case 'explanation':
                return (
                    <ExplanationScreen
                        lesson={this.props.lesson}
                        explanation={this.state.explanations[this.state.explanations.length - 1]}
                        theme={this.props.theme}
                        changedMastery={this.state.changedMastery}
                        practiceDisabled={!this.state.nextQuestion}
                        practice={this.goToQuestion}
                        finish={() => {
                            this.setState({mode: 'finish'});
                            const {lesson} = this.props;
                            Http.collectData(
                                'finish for now learn',
                                {lesson},
                                () => {
                                },
                                console.warn
                            );
                        }}
                    />
                );
            case 'finish':
                return (
                    <FinishScreen
                        lesson={this.props.lesson}
                        theme={this.props.theme}
                        changedMastery={this.state.changedMastery}
                        questions={this.state.questions}
                        explanations={this.state.explanations}
                        answers={this.state.answers}
                    />
                );
        }
    }

    goToQuestion = () => {
        const {mode, nextQuestion} = this.state;
        const {lesson} = this.props;
        if (mode === 'lesson')
            Http.collectData(
                'practice concept learn',
                {question: nextQuestion, lesson},
                () => {
                },
                console.warn
            );
        else if (mode === 'explanation')
            Http.collectData(
                'practice concept more learn',
                {question: nextQuestion, lesson},
                () => {
                },
                console.warn
            );
        this.setState({mode: 'question'});
    };

    changeAnswer = (index: number) => (answer: string) => {
        const newAnswerList = [...this.state.nextAnswers];
        newAnswerList[index] = answer;
        this.setState({nextAnswers: newAnswerList});
    };

    submitAnswer = () => {
        const question = this.state.nextQuestion as AvoLessonData;
        const {lesson} = this.props;
        Http.submitQuestion(
            question.ID,
            question.seed,
            this.state.nextAnswers,
            res => {
                const points = res.points.reduce((x, y) => x + y, 0);
                const total = res.totals.reduce((x, y) => x + y, 0);
                if (points / total < 0.5) {
                    this.showModal();
                }
                const questions = [...this.state.questions, question];
                const answers = [...this.state.answers, this.state.nextAnswers];
                const explanations = [...this.state.explanations, res];
                const changedMastery = res.mastery[this.props.lesson.conceptID] || 0;
                Http.collectData(
                    'submit answer learn',
                    {
                        question,
                        results: res,
                        changedMastery,
                        answers: this.state.nextAnswers,
                        lesson
                    },
                    () => {
                    },
                    console.warn
                );
                this.setState(
                    {
                        questions,
                        explanations,
                        changedMastery,
                        answers,
                        nextQuestion: undefined,
                        nextAnswers: [],
                        mode: 'explanation',
                    },
                    () => {
                        this.props.updateMastery(res.mastery);
                        this.getQuestion();
                    },
                );
                resetShowConceptGraphButton();
            },
            console.warn,
        );
    };

    showModal = () => {
        this.setState({incorrectAnswerModalDisplay: 'block'});
    };

    backFromQuestion = () => {
        const {lesson} = this.props;
        this.setState({mode: 'lesson'});
        resetShowConceptGraphButton();
        Http.collectData(
            'go back to lesson learn',
            {lesson},
            () => {
            },
            console.warn
        );
    };
}

function resetShowConceptGraphButton() {
    const showConceptGraph: HTMLElement = document.querySelector(
        '[title="Show Concept Graph"]',
    ) as HTMLElement;
    if (showConceptGraph) {
        showConceptGraph.style.right = '12vw';
        showConceptGraph.style.top = '0';
    }
}
