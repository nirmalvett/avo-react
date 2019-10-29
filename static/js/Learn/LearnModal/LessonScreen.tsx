import React, {Fragment, PureComponent} from 'react';
import {Button, IconButton, Typography} from '@material-ui/core';
import {getMathJax} from '../../HelperFunctions/Utilities';
import AVOMasteryGauge from '../MasteryGauge';
import {AvoLesson} from '../Learn';
import {ThemeObj} from '../../Models';
import {LooksOne, LooksTwo, Looks3, Looks4, Looks5} from '@material-ui/icons';
import * as Http from '../../Http';

interface LessonScreenProps {
    lesson: AvoLesson;
    disabled: boolean;
    theme: ThemeObj;
    next: () => void;
    survey: (mastery: number, aptitude: number) => () => void;
}

const surveyIcons = [LooksOne, LooksTwo, Looks3, Looks4, Looks5];

export class LessonScreen extends PureComponent<LessonScreenProps> {
    render() {
        const {lesson, theme, disabled, next} = this.props;
        return (
            <Fragment>
                <div style={{flex: 1, overflowY: 'auto'}}>
                    <Typography variant='h6'>{lesson.name}</Typography>
                    {getMathJax(lesson.lesson, 'body2')}
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                    }}
                >
                    <AVOMasteryGauge
                        comprehension={Math.floor(lesson.mastery * 100)}
                        theme={theme}
                    />
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <Typography>How well do you understand it?</Typography>
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            {surveyIcons.map((Icon, index) => (
                                <IconButton
                                    color={
                                        index === lesson.masterySurvey - 1 ? 'primary' : 'default'
                                    }
                                    onClick={this.updateMastery(index + 1)}
                                >
                                    <Icon />
                                </IconButton>
                            ))}
                        </div>
                        <Typography>How easy was it?</Typography>
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            {surveyIcons.map((Icon, index) => (
                                <IconButton
                                    color={
                                        index === lesson.aptitudeSurvey - 1 ? 'primary' : 'default'
                                    }
                                    onClick={this.updateAptitude(index + 1)}
                                >
                                    <Icon />
                                </IconButton>
                            ))}
                        </div>
                    </div>
                    <Button variant='outlined' color='primary' disabled={disabled} onClick={next}>
                        Practice Concept
                    </Button>
                </div>
            </Fragment>
        );
    }

    updateMastery = (mastery: number) => () => {
        Http.postQuestionSurvey(
            this.props.lesson.conceptID,
            mastery,
            this.props.lesson.aptitudeSurvey,
            this.props.survey(mastery, this.props.lesson.aptitudeSurvey),
            console.warn,
        );
    };

    updateAptitude = (aptitude: number) => () => {
        Http.postQuestionSurvey(
            this.props.lesson.conceptID,
            this.props.lesson.masterySurvey,
            aptitude,
            this.props.survey(this.props.lesson.masterySurvey, aptitude),
            console.warn,
        );
    };
}
