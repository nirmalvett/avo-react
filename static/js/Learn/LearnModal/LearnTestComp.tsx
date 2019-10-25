import React, {Component, Fragment, ReactElement} from 'react';
import * as Http from '../../Http';
import {AvoLesson, AvoLessonData} from '../Learn';
import AVOLearnIncorrectAnswerModal from '../AVOLearnIncorrectAnswerModal';
import {ThemeObj} from '../../Models';
import {LessonScreen} from './LessonScreen';
import {QuestionScreen} from './QuestionScreen';
import {ExplanationScreen} from './ExplanationScreen';
import {FinishScreen} from './FinishScreen';

interface LearnTestCompProps {
    lesson: AvoLesson;
    updateMastery: (mastery: {[conceptID: number]: number}) => void;
    theme: ThemeObj;
    onClose: () => void;
}

interface LearnTestCompState {
    mode: 'lesson' | 'question' | 'explanation' | 'finish';

    readonly questions: AvoLessonData[];
    readonly answers: string[][];
    readonly explanations: Http.SubmitQuestion[];

    nextQuestion: AvoLessonData | undefined;
    readonly nextAnswers: string[];

    changedMastery: number;
    postLessonModalDisplay: 'none' | 'block';
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
            postLessonModalDisplay: 'none',
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
                    hideModal={() => this.setState({postLessonModalDisplay: 'none'})}
                    modalDisplay={this.state.postLessonModalDisplay}
                    lesson={this.props.lesson as AvoLesson}
                    questionID={(this.state.nextQuestion || {ID: 0}).ID}
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
                    />
                );
            case 'question':
                return (
                    <QuestionScreen
                        question={this.state.nextQuestion as AvoLessonData}
                        answers={this.state.nextAnswers}
                        changeAnswer={this.changeAnswer}
                        back={() => this.setState({mode: 'lesson'})}
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
                        finish={() => this.setState({mode: 'finish'})}
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

    goToQuestion = () => this.setState({mode: 'question'});

    changeAnswer = (index: number) => (answer: string) => {
        const newAnswerList = [...this.state.nextAnswers];
        newAnswerList[index] = answer;
        this.setState({nextAnswers: newAnswerList});
    };

    submitAnswer = () => {
        const question = this.state.nextQuestion as AvoLessonData;
        Http.submitQuestion(
            question.ID,
            question.seed,
            this.state.nextAnswers,
            res => {
                // const points = res.points.reduce((x, y) => x + y, 0);
                // const total = res.totals.reduce((x, y) => x + y, 0);
                // if (points / total < 0.5) {
                //     this.showModal();
                // }
                const questions = [...this.state.questions, question];
                const answers = [...this.state.answers, this.state.nextAnswers];
                const explanations = [...this.state.explanations, res];
                const changedMastery = res.mastery[this.props.lesson.conceptID] || 0;
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
            },
            console.warn,
        );
    };

    showModal = () => {
        this.setState({postLessonModalDisplay: 'block'});
    };
}
