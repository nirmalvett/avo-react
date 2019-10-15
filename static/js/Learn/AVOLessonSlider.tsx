import React, {Component, ReactElement} from 'react';
import {
    Card,
    Grid,
    Icon,
    IconButton,
    Typography,
    Fade,
    Slider,
    withStyles,
} from '@material-ui/core';
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
    };
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
    showPostLessonModal: () => void;
    updateParentCurrentLesson: (lesson: AvoLesson) => void;
}

interface AVOLessonSliderState {
    fsmRef: {current: AVOLessonFSM};
    currentLesson: (AvoLesson & AvoLessonData) | undefined;
    currentIndex: number;
    changedCurrency: 0;
    slides: AvoLesson[][];
    isEndTest: boolean;
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
            isEndTest: false,
        };
    }

    render() {
        const {currentLesson} = this.state;
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
                <Grid container xs={10} style={{position: 'relative'}}>
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
                    showPostLessonModal={this.props.showPostLessonModal}
                    isEndTest={this.state.isEndTest}
                    ref={this.state.fsmRef}
                >
                    {!!this.state.currentLesson && (
                        <AVOLearnTestComp
                            lesson={this.state.currentLesson}
                            updateMastery={this.props.updateMastery}
                            theme={this.props.theme}
                            setEndTest={this.setEndTest}
                            getNewQuestion={this.getNewQuestion}
                        />
                    )}
                </AVOLessonFSM>
                <AVOPageSlider
                    color='primary'
                    valueLabelDisplay='auto'
                    aria-label='avo page slider'
                    min={0}
                    max={this.state.slides.length - 1}
                    onChange={(_, value: number | number[]) =>
                        this.setState({currentIndex: value as number})
                    }
                    value={this.state.currentIndex}
                    valueLabelFormat={() =>
                        formatLabel(
                            this.state.currentIndex,
                            3,
                            this.state.slides[this.state.currentIndex].length,
                        )
                    }
                />
            </Grid>
        );
    }
    getSlideRenderable = () => {
        const output: ReactElement[] = [];
        this.state.slides.forEach((group, gIndex) => {
            let slideGroup: ReactElement[] = [];
            group.forEach((lesson, LIndex) => {
                slideGroup.push(
                    <Fade in={this.getSlideTranslation(gIndex) == 0}>
                        <Grid item xs={4}>
                            <Card
                                className={`avo-card`}
                                style={{
                                    padding: '10px',
                                    flex: 1,
                                    margin: 'none',
                                    width: 'auto',
                                    display: 'flex',
                                    position: 'relative',
                                    flexDirection: 'column',
                                }}
                                id={`avo-lesson__card-${LIndex}-${gIndex}`}
                                key={`avo-learn__card-key:${LIndex}`}
                            >
                                <IconButton
                                    onClick={() =>
                                        this.openLessonFSM(lesson, `${LIndex}-${gIndex}`)
                                    }
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
                                />
                                <Typography variant={'h6'}>{lesson.Tag}</Typography>
                                <Typography variant={'subtitle1'}>
                                    {lesson.string.substring(0, 20)}...
                                </Typography>
                            </Card>
                        </Grid>
                    </Fade>,
                );
            });
            output.push(
                <Grid
                    item
                    container
                    xs={12}
                    spacing={6}
                    style={{
                        position: 'absolute',
                        transition: 'transform 1s ease-in',
                        willChange: 'transform',
                        transform: `translateX(${this.getSlideTranslation(gIndex)}vw)`,
                    }}
                    direction='column'
                >
                    <Grid
                        container
                        item
                        xs={12}
                        style={{height: 'calc(calc(100vh - 64px) / 2)', padding: '5px'}}
                    >
                        {slideGroup.slice(0, 3)}
                    </Grid>
                    <Grid
                        container
                        item
                        xs={12}
                        style={{height: 'calc(calc(100vh - 64px) / 2)', padding: '5px'}}
                    >
                        {slideGroup.slice(3, 6)}
                    </Grid>
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

    sliderChange = (value: number) => {
        this.setState({currentIndex: value});
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
            if (slideCounter === 5) slideCounter = 0;
            else slideCounter++;
        });
        return output;
    };
    getNewQuestion = () => {
        this.setState({isEndTest: false});
        const lesson = this.state.currentLesson;
        if (lesson) {
            Http.getNextQuestion(
                lesson.ID,
                res => {
                    console.log(res);
                    this.setState({currentLesson: {...lesson, data: {questions: [res]}}});
                },
                err => {
                    console.log(err);
                },
            );
        }
    };
    openLessonFSM = (lesson: AvoLesson, LIndex: string) => {
        this.setState({isEndTest: false});
        Http.getNextQuestion(
            lesson.ID,
            res => {
                console.log(res);
                this.setState({currentLesson: {...lesson, data: {questions: [res]}}});
                this.props.updateParentCurrentLesson(lesson);
                this.state.fsmRef.current.handleFSM(lesson, LIndex);
            },
            err => {
                console.log(err);
            },
        );
    };
    setEndTest = () => {
        this.setState({isEndTest: true});
    };
}

// Takes in the current slide index and its length to determine the range for the slider to present
function formatLabel(index: number, length: number, range: number): string {
    if (range === 1) return `${index * length + 1}`;
    return `${index * length + 1} - ${index * length + range}`;
}

function getLabelElement(index: number): React.ElementType {
    // index + 1 + <slide group size>
    // if (index + 4 < 10)
    //     return <span />;
    // return <span style={{fontSize: '0.8em'}}/>
    return 'span';
}

const AVOPageSlider = withStyles({
    root: {
        height: 8,
        width: '90%',
        margin: 'auto',
    },
    thumb: {
        height: 24,
        width: 24,
        backgroundColor: '#fff',
        border: '2px solid currentColor',
        marginTop: -8,
        marginLeft: -12,
        '&:focus,&:hover,&$active': {
            boxShadow: 'inherit',
        },
    },
    active: {},
    valueLabel: {
        left: 'calc(-50% + 0px)',
        '& > span': {
            height: 40,
            width: 40,
        },
    },
    track: {
        height: 8,
        borderRadius: 4,
    },
    rail: {
        height: 8,
        borderRadius: 4,
    },
})(Slider);
