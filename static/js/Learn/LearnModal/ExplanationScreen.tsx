import {Button, Grid, Typography} from '@material-ui/core';
import {getMathJax} from '../../HelperFunctions/Utilities';
import AVOMasteryGauge from '../MasteryGauge';
import React from 'react';
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
            {
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
                                    comprehension={Math.floor(props.changedMastery * 100)}
                                    theme={props.theme}
                                />
                                <Typography variant={'subtitle2'}>
                                    Mastery of {props.lesson.name} changed by{' '}
                                    {((props.changedMastery - props.lesson.mastery) * 100).toFixed(
                                        2,
                                    )}
                                    %
                                </Typography>
                            </div>
                        </Grid>
                        <Grid container xs={12}>
                            <Button
                                variant='outlined'
                                color='primary'
                                onClick={props.practice}
                                style={{marginLeft: 'auto', marginRight: 15}}
                                disabled={props.practiceDisabled}
                            >
                                Practice Concept
                            </Button>
                            <Button variant='outlined' color='primary' onClick={props.finish}>
                                Finish concept for now
                            </Button>
                        </Grid>
                    </Grid>
                </div>
            }
        </div>
    );
}
