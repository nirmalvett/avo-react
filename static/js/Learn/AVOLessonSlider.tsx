import React, {Component, ReactElement} from 'react';
import {Card, Grid, Icon, IconButton, Typography} from '@material-ui/core';
import AVOLessonFSM from './AVOLessonFSM';
import AVOMasteryGauge from './MasteryGauge';
import AVOLearnTestComp from './AVOLearnTestComp';
import * as Http from '../Http';
import {AvoLesson} from './AVOLearnComponent';

export interface AvoLessonData {
    data: {
        questions: {
            prompt: string;
            prompts: string[];
            types: string[];
            ID: number;
            seed: number;
        }[];
    }
}

interface AVOLessonSliderProps {
    slides: AvoLesson[];
    theme: {
        color: {
            '100': string;
            '200': string;
            '500': string;
        };
        theme: 'light' | 'dark';
    };
    changeToNewMastery: () => void;
    updateMastery: (mastery: number, lessonID: number) => void;
}

interface AVOLessonSliderState {
    fsmRef: {current: AVOLessonFSM};
    currentLesson: (AvoLesson & AvoLessonData) | undefined;
    currentIndex: number;
    changedCurrency: 0;
    slides: AvoLesson[][];
}

export default class AVOLessonSlider extends Component<AVOLessonSliderProps, AVOLessonSliderState> {
    constructor(props: AVOLessonSliderProps) {
        super(props);
        this.state = {
            fsmRef: React.createRef() as {current: AVOLessonFSM},
            currentLesson: undefined,
            currentIndex: 0,
            changedCurrency: 0,
            slides: this.processSlidesIntoGroups(this.props.slides),
        };
    }

    render() {
        return (
            <Grid container id='avo-lesson__layout-div'>
                <Grid xs={1} style={{zIndex: 10}}>
                    <div style={{textAlign: 'center'}}>
                        <IconButton
                            aria-label='chevron_left'
                            onClick={this.goToPreviousSlide}
                            color='primary'
                            style={{marginTop: '25vh'}}
                        >
                            <Icon>chevron_left</Icon>
                        </IconButton>
                    </div>
                </Grid>
                <Grid xs={10} style={{position: 'relative'}}>
                    {this.getSlideRenderable()}
                </Grid>
                <Grid xs={1} style={{zIndex: 10}}>
                    <div style={{textAlign: 'center'}}>
                        <IconButton
                            aria-label='chevron_right'
                            onClick={this.goToNextSlide}
                            color='primary'
                            style={{marginTop: '25vh'}}
                        >
                            <Icon>chevron_right</Icon>
                        </IconButton>
                    </div>
                </Grid>
                <AVOLessonFSM
                    changeToNewMastery={this.props.changeToNewMastery}
                    ref={this.state.fsmRef}
                >
                    {!!this.state.currentLesson && (
                        <AVOLearnTestComp
                            lesson={this.state.currentLesson}
                            updateMastery={this.props.updateMastery}
                        />
                    )}
                </AVOLessonFSM>
            </Grid>
        );
    }

    getSlideRenderable = () => {
        const output: ReactElement[] = [];
        this.state.slides.forEach((group, gIndex) => {
            let slideGroup: ReactElement[] = [];
            group.forEach((lesson, LIndex) => {
                slideGroup.push(
                    <Grid item xs={4}>
                        <Card
                            className={`avo-card`}
                            style={{
                                padding: '10px',
                                flex: 1,
                                margin: 'none',
                                width: 'auto',
                                display: 'flex',
                                height: '50vh',
                                position: 'relative',
                                flexDirection: 'column',
                            }}
                            id={`avo-lesson__card-${LIndex}-${gIndex}`}
                            key={`avo-learn__card-key:${LIndex}`}
                        >
                            <IconButton
                                onClick={() => this.openLessonFSM(lesson, `${LIndex}-${gIndex}`)}
                                color='primary'
                                aria-label='fullscreen'
                                style={{
                                    position: 'absolute',
                                    right: '0.125em',
                                    top: '0.125em',
                                    zIndex: 10,
                                }}
                            >
                                <Icon>fullscreen</Icon>
                            </IconButton>
                            <AVOMasteryGauge
                                theme={this.props.theme}
                                comprehension={Math.floor(
                                    (lesson.newMastery || lesson.mastery) * 100,
                                )}
                                colors={['#399103', '#039124', '#809103']}
                            />
                            <Typography variant={'h6'}>{lesson.Tag}</Typography>
                            <Typography variant={'subtitle1'}>
                                {lesson.string.substring(0, 20)}...
                            </Typography>
                        </Card>
                    </Grid>,
                );
            });
            output.push(
                <Grid
                    container
                    xs={12}
                    spacing={6}
                    style={{
                        position: 'absolute',
                        transition: 'transform 1s ease-in',
                        willChange: 'transform',
                        transform: `translateX(${this.getSlideTranslation(gIndex)}vw)`,
                    }}
                >
                    {slideGroup}
                </Grid>,
            );
        });
        return output;
    };

    getSlideTranslation = (index: number) => {
        if (index < this.state.currentIndex) return -75;
        if (index > this.state.currentIndex) return 75;
        return 0;
    };

    goToPreviousSlide = () => {
        const currentIndex = this.state.currentIndex;
        if (currentIndex == 0) return;
        this.setState({currentIndex: currentIndex - 1});
    };

    goToNextSlide = () => {
        const currentIndex = this.state.currentIndex;
        if (currentIndex > this.state.slides.length - 2) return;
        this.setState({currentIndex: currentIndex + 1});
    };

    processSlidesIntoGroups = (slides: AvoLesson[]) => {
        const output: AvoLesson[][] = [];
        let slideCounter = 0;
        let groupCounter = -1;
        slides.forEach(slide => {
            if (slideCounter === 0) {
                output.push([]);
                groupCounter++;
            }
            output[groupCounter].push(slide);
            if (slideCounter === 2) slideCounter = 0;
            else slideCounter++;
        });
        return output;
    };

    openLessonFSM = (lesson: AvoLesson, LIndex: string) => {
        Http.getLessonData(
            lesson.ID,
            res => {
                console.log(res);
                this.setState({currentLesson: {...lesson, data: res}});
                this.state.fsmRef.current.handleFSM(lesson, LIndex);
            },
            err => {
                console.log(err);
            },
        );
    };
}
