import React from 'react';
import {Button, Grid, Typography} from '@material-ui/core';
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
        <Grid container spacing={8}>
            <Grid item xs={8}>
                <Typography variant={'h6'}>{props.lesson.name}</Typography>
                <Typography variant={'subtitle1'}>
                    {getMathJax(props.lesson.lesson, 'body2')}
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
                        comprehension={Math.floor(props.lesson.mastery * 100)}
                        theme={props.theme}
                    />
                </div>
                <Button
                    variant='outlined'
                    color='primary'
                    disabled={props.disabled}
                    onClick={props.next}
                    style={{float: 'right'}}
                >
                    Practice Concept
                </Button>
            </Grid>
        </Grid>
    );
}
