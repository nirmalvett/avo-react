import {Button, Typography} from '@material-ui/core';
import {getMathJax} from '../../HelperFunctions/Utilities';
import AVOMasteryGauge from '../MasteryGauge';
import React, {Fragment} from 'react';
import {SubmitQuestion} from '../../Http';
import {ThemeObj} from '../../Models';
import {AvoLesson} from '../Learn';

interface ExplanationScreenProps {
    lesson: AvoLesson;
    explanation: SubmitQuestion;
    theme: ThemeObj;
    changedMastery: number;
    practiceDisabled: boolean;
    practice: () => void;
    finish: () => void;
}

export function ExplanationScreen(props: ExplanationScreenProps) {
    const explanation = props.explanation;
    const change = Math.abs((props.changedMastery - props.lesson.mastery) * 100).toFixed(2);
    const changeString = props.changedMastery > props.lesson.mastery ? 'gained': 'lost'
    return (
        <Fragment>
            <div style={{flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto'}}>
                {explanation.explanation.map(x => getMathJax(x))}
            </div>
            <div style={{maxWidth: '200px'}}>
                <AVOMasteryGauge
                    comprehension={Math.floor(props.changedMastery * 100)}
                    theme={props.theme}
                />
                <Typography variant='subtitle2'>
                    You {changeString} {change}% mastery in {props.lesson.name}
                </Typography>
            </div>
            <div
                style={{
                    position: 'absolute',
                    right: '16px',
                    bottom: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                }}
            >
                <Button
                    variant='outlined'
                    color='primary'
                    onClick={props.practice}
                    style={{marginBottom: 4}}
                    disabled={props.practiceDisabled}
                >
                    Practice more
                </Button>
                <Button variant='outlined' color='primary' onClick={props.finish}>
                    Finish for now
                </Button>
            </div>
        </Fragment>
    );
}
