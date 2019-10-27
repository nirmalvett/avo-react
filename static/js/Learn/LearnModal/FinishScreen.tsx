import React, {Component, Fragment} from 'react';
import {Grow, IconButton, Typography} from '@material-ui/core';
import AVOLearnTestCongrat from './AVOLearnTestCongrat';
import AVOMasteryGauge from '../MasteryGauge';
import {AvoLesson, AvoLessonData} from '../Learn';
import {ThemeObj} from '../../Models';
import {SubmitQuestion} from '../../Http';
import {getMathJax} from '../../HelperFunctions/Utilities';
import {AnswerInput} from '../../AnswerInput';
import {ChevronLeft, ChevronRight} from "@material-ui/icons";

interface FinishScreenProps {
    lesson: AvoLesson;
    theme: ThemeObj;
    changedMastery: number;
    questions: AvoLessonData[];
    explanations: SubmitQuestion[];
    answers: string[][];
}

interface FinishScreenState {
    mode: 'mastery gauge' | 'explanation'
    index: number;
}

export class FinishScreen extends Component<FinishScreenProps, FinishScreenState> {
    timer?: any;

    constructor(props: FinishScreenProps) {
        super(props);
        this.state = {
            mode: 'mastery gauge',
            index: 0,
        };
    }

    componentDidMount() {
        this.timer = setTimeout(() => this.setState({mode: 'explanation'}), 3000);
    }

    componentWillUnmount(): void {
        clearTimeout(this.timer);
    }

    render() {
        return (
            <Fragment>
                <Grow in={this.state.mode === 'mastery gauge'} timeout={{enter: 1000, exit: 500}} style={{position: 'absolute', alignSelf: 'center', justifySelf: 'center'}}>
                    {this.renderSpinner()}
                </Grow>
                <Grow in={this.state.mode === 'explanation'} timeout={{enter: 1500}}>
                    {this.renderExplanations()}
                </Grow>
            </Fragment>
        );
    }

    renderSpinner() {
        return (
            <div style={{flex: 1, left: '50%', right: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <AVOLearnTestCongrat colors={['#399103', '#039124', '#809103']} />
            </div>
        );
    }

    renderExplanations() {
        const change = Math.abs((this.props.changedMastery - this.props.lesson.mastery) * 100).toFixed(2);
        const changeString = this.props.changedMastery > this.props.lesson.mastery ? 'gained': 'lost'
        return (
            <div style={{flex: 1, display: 'flex', flexDirection: 'row'}}>
                <IconButton onClick={this.prev} disabled={this.state.index === 0} color='primary' style={{zIndex: 1, alignSelf: 'center'}}><ChevronLeft/></IconButton>
                <div style={{flex: 1, display: 'flex', flexDirection: 'column', position: 'relative'}}>
                    <Typography variant={'h6'}>{this.props.lesson.name}</Typography>
                    {this.props.questions.map((q, i) => (
                        <IndividualExplanation
                            question={q}
                            answers={this.props.answers[i]}
                            explanation={this.props.explanations[i]}
                            translate={i - this.state.index}
                        />
                    ))}
                </div>
                <IconButton onClick={this.next} disabled={this.state.index === this.props.questions.length - 1} color='primary' style={{zIndex: 1, alignSelf: 'center'}}><ChevronRight/></IconButton>
                <div style={{maxWidth: '200px'}}>
                    <AVOMasteryGauge
                        comprehension={Math.floor(this.props.changedMastery * 100)}
                        theme={this.props.theme}
                    />
                    <Typography variant='subtitle2'>
                        You {changeString} {change}% mastery in {this.props.lesson.name}
                    </Typography>
                </div>
            </div>
        );
    }

    prev = () => this.setState({index: this.state.index - 1});

    next = () => this.setState({index: this.state.index + 1});
}

interface IndividualExplanationProps {
    question: AvoLessonData;
    explanation: SubmitQuestion;
    answers: string[];
    translate: number;
}

function IndividualExplanation({
    question,
    explanation,
    answers,
    translate,
}: IndividualExplanationProps) {
    return (
        <div
            style={{
                top: '40px',
                minHeight: 'calc(100% - 40px)',
                maxHeight: 'calc(100% - 40px)',
                position: 'absolute',
                transition: 'transform 1s ease-in, opacity 500ms ease-in',
                opacity: translate ? 0 : 1,
                willChange: 'transform',
                transform: `translateX(${translate}00%)`,
                overflowY: 'auto',
            }}
        >
            {getMathJax(question.prompt)}
            {question.prompts.map((p, idx) => (
                <AnswerInput
                    type={question.types[idx]}
                    value={answers[idx]}
                    prompt={p}
                    disabled={true}
                    onChange={() => {}}
                    save={() => {}}
                />
            ))}
            <div>{explanation.explanation.map(x => getMathJax(x))}</div>
        </div>
    );
}
