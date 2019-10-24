import React, {Fragment} from 'react';
import {Button, Typography} from '@material-ui/core';
import {getMathJax} from '../../HelperFunctions/Utilities';
import AVOMasteryGauge from '../MasteryGauge';
import {AvoLesson} from '../Learn';
import {ThemeObj} from '../../Models';

interface LessonScreenProps {
    lesson: AvoLesson;
    disabled: boolean;
    theme: ThemeObj;
    next: () => void;
}

export function LessonScreen(props: LessonScreenProps) {
    return (
        <Fragment>
            <div style={{flex: 1, overflowY: 'auto'}}>
                <Typography variant='h6'>{props.lesson.name}</Typography>
                {getMathJax(props.lesson.lesson, 'body2')}
            </div>
            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end'}}>
                <AVOMasteryGauge
                    comprehension={Math.floor(props.lesson.mastery * 100)}
                    theme={props.theme}
                />
                <Button
                    variant='outlined'
                    color='primary'
                    disabled={props.disabled}
                    onClick={props.next}
                >
                    Practice Concept
                </Button>
            </div>
        </Fragment>
    );
}
