import React, {Component, Fragment} from 'react';
import {Grid, Grow, Typography} from '@material-ui/core';
import AVOLearnTestCongrat from './AVOLearnTestCongrat';
import AVOMasteryGauge from '../MasteryGauge';
import {AvoLesson, AvoLessonData} from '../Learn';
import {ThemeObj} from '../../Models';
import {SubmitQuestion} from '../../Http';
import {getMathJax} from '../../HelperFunctions/Utilities';
import {AnswerInput} from '../../AnswerInput';

interface FinishScreenProps {
    lesson: AvoLesson;
    theme: ThemeObj;
    changedMastery: number;
    questions: AvoLessonData[];
    explanations: SubmitQuestion[];
    answers: string[][];
}

interface FinishScreenState {
    index: 0;
}

export class FinishScreen extends Component<FinishScreenProps, FinishScreenState> {
    constructor(props: FinishScreenProps) {
        super(props);
        this.state = {
            index: 0,
        };
    }

    render() {
        return (
            <Fragment>
                <Grow in={true} timeout={{enter: 1000, exit: 500}}>
                    <div style={{position: 'absolute', width: '100%'}}>
                        <div
                            className='avo-card'
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
                            <AVOLearnTestCongrat colors={['#399103', '#039124', '#809103']} />
                        </div>
                    </div>
                </Grow>
                <Grow in={true} timeout={{enter: 1500}}>
                    <Grid container spacing={8} style={{position: 'absolute'}}>
                        <Grid item xs={8}>
                            <Typography variant={'h6'}>{this.props.lesson.name}</Typography>
                            <Grid container spacing={8}>
                                <Grid item xs={12} style={{position: 'relative'}}>
                                    {this.props.questions.map((q, i) => (
                                        <IndividualExplanation
                                            question={q}
                                            answers={this.props.answers[i]}
                                            explanation={this.props.explanations[i]}
                                            translate={i - this.state.index}
                                        />
                                    ))}
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
                                    comprehension={Math.floor(this.props.changedMastery * 100)}
                                    theme={this.props.theme}
                                />
                                <Typography variant={'body2'}>
                                    Mastery of {this.props.lesson.name} changed by{' '}
                                    {(
                                        (this.props.changedMastery - this.props.lesson.mastery) *
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
                position: 'absolute',
                transition: 'transform 1s ease-in, opacity 500ms ease-in',
                opacity: translate ? 0 : 1,
                willChange: 'transform',
                transform: `translateX(${translate * 100}%)`,
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
                            value={answers[idx]}
                            prompt={p}
                            disabled={true}
                            onChange={() => {}}
                            save={() => {}}
                        />
                    </div>
                </>
            ))}
            <br />
            <div>{explanation.explanation.map(x => getMathJax(x))}</div>
        </div>
    );
}
