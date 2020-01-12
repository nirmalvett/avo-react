import React, {Fragment, PureComponent} from 'react';
import {Button, IconButton, Typography, Tooltip} from '@material-ui/core';
import AVOMasteryGauge from '../MasteryGauge';
import {AvoLesson} from '../Learn';
import {ThemeObj} from '../../Models';
import {LooksOne, LooksTwo, Looks3, Looks4, Looks5} from '@material-ui/icons';
import * as Http from '../../Http';
import {Content} from '../../HelperFunctions/Content';
import InquiryPopup from './OrganicContentCreation/InquiryPopup';
import {ShowSnackBar} from "../../Layout/Layout";

interface LessonScreenProps {
    lesson: AvoLesson;
    disabled: boolean;
    theme: ThemeObj;
    next: () => void;
    survey: (mastery: number, aptitude: number) => () => void;
    showSnackBar: ShowSnackBar;
}

const surveyIcons = [
    {'icon': LooksOne, 'understandTooltip': "I'm extremely confused", 'easyToolTip': 'I was unable to do it at all'},
    {'icon': LooksTwo, 'understandTooltip': "I didn't understand most of it", 'easyToolTip': "It was extremely hard"},
    {'icon': Looks3, 'understandTooltip': "I understood some of it", 'easyToolTip': "It was challenging but doable"},
    {'icon': Looks4, 'understandTooltip': "I understand most of it", 'easyToolTip': "It was not difficult"},
    {'icon': Looks5, 'understandTooltip': "Understand it completely", 'easyToolTip': "It was extremely easy"},
];

export class LessonScreen extends PureComponent<LessonScreenProps> {
    render() {
        const {lesson, theme, disabled, next} = this.props;
        return (
            <Fragment>
                <div style={{flex: 1, overflowY: 'auto'}}>
                    <Typography variant='h6'>{lesson.name}</Typography>
                    <Content variant='body2'>{lesson.lesson}</Content>
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
                            {surveyIcons.map((surveyIcon, index) => {
                                const Icon = surveyIcon['icon'];
                                return (
                                    <Tooltip title={surveyIcon['understandTooltip']}>
                                        <IconButton
                                            color={
                                                index === lesson.masterySurvey - 1 ? 'primary' : 'default'
                                            }
                                            onClick={this.updateMastery(index + 1)}
                                        >
                                            <Icon/>
                                        </IconButton>
                                    </Tooltip>

                                )
                            })}
                        </div>
                        <Typography>How easy was it?</Typography>
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            {surveyIcons.map((surveyIcon, index) => {
                                const Icon = surveyIcon['icon'];
                                return (
                                    <Tooltip title={surveyIcon['easyToolTip']}>
                                        <IconButton
                                            color={
                                                index === lesson.aptitudeSurvey - 1 ? 'primary' : 'default'
                                            }
                                            onClick={this.updateAptitude(index + 1)}
                                        >
                                            <Icon/>
                                        </IconButton>
                                    </Tooltip>

                                )
                            })}
                        </div>
                    </div>
                    <InquiryPopup
                        ID={lesson.conceptID}
                        object={lesson.lesson}
                        showSnackBar={this.props.showSnackBar}
                    />
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
