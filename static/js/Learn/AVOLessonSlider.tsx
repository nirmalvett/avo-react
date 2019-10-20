import React, {Component, ReactElement} from 'react';
import {Card, IconButton, Tooltip, Typography, Slider, withStyles} from '@material-ui/core';
import {ChevronLeft, ChevronRight, Fullscreen, LockOpen, LockOutlined} from '@material-ui/icons';
import AVOLessonFSM from './AVOLessonFSM';
import AVOMasteryGauge from './MasteryGauge';
import AVOLearnTestComp from './AVOLearnTestComp';
import * as Http from '../Http';
import {AvoLesson} from './AVOLearnComponent';
import {green, lightGreen, orange, red} from "@material-ui/core/colors";

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
    isEndTest: boolean;
}

export default class AVOLessonSlider extends Component<AVOLessonSliderProps, AVOLessonSliderState> {
    constructor(props: AVOLessonSliderProps) {
        super(props);
        this.state = {
            fsmRef: React.createRef() as {current: AVOLessonFSM},
            currentLesson: undefined,
            currentIndex: 0,
            isEndTest: false,
        };
    }

    render() {
        return (
            <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                <div style={{flex: 1, display: 'flex', flexDirection: 'row'}}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 3,
                        }}
                    >
                        <IconButton
                            aria-label='chevron_left'
                            onClick={this.goToPreviousSlide}
                            color='primary'
                            disabled={this.state.currentIndex <= 0}
                        >
                            <ChevronLeft />
                        </IconButton>
                    </div>
                    <div style={{flex: 1, position: 'relative'}}>{this.getSlide()}</div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 3,
                        }}
                    >
                        <IconButton
                            aria-label='chevron_right'
                            onClick={this.goToNextSlide}
                            color='primary'
                            disabled={
                                this.state.currentIndex >=
                                Math.ceil(this.props.slides.length / 6) - 1
                            }
                        >
                            <ChevronRight />
                        </IconButton>
                    </div>
                </div>
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
                    max={Math.ceil(this.props.slides.length / 6) - 1}
                    onChange={(_, value: number | number[]) =>
                        this.setState({currentIndex: value as number})
                    }
                    style={{zIndex: 2}}
                    value={this.state.currentIndex}
                    valueLabelFormat={() =>
                        formatLabel(this.state.currentIndex, 6, this.getGroup().length)
                    }
                />
            </div>
        );
    }

    getGroup = (index = 0) => {
        const idx = this.state.currentIndex + index;
        if (idx >= 0 && idx < Math.ceil(this.props.slides.length))
            return this.props.slides.slice(6 * idx, 6 * (idx + 1));
        else {
            return [];
        }
    };

    getCard = (group: AvoLesson[], gIndex: number, lesson: AvoLesson, LIndex: number) => (
        <Card
            className={`avo-card`}
            style={{
                padding: 0,
                margin: '4px',
                display: 'flex',
                position: 'relative',
                flexDirection: 'column',
                minHeight: '100%',
                width: 'calc(33.3% - 10px)',
            }}
            id={`avo-lesson__card-${LIndex}-${gIndex + this.state.currentIndex}`}
            key={`avo-learn__card-key:${LIndex}`}
        >
            {getIconDisplay(lesson.preparation)}
            <IconButton
                onClick={() =>
                    this.openLessonFSM(lesson, `${LIndex}-${gIndex + this.state.currentIndex}`)
                }
                disabled={gIndex !== 1}
                color='primary'
                aria-label='fullscreen'
                style={{
                    position: 'absolute',
                    margin: '4px',
                    right: 0,
                    top: 0,
                    zIndex: 10,
                }}
            >
                <Fullscreen />
            </IconButton>
            <AVOMasteryGauge
                theme={this.props.theme}
                margin={0}
                width='80%'
                height='80%'
                comprehension={Math.floor((lesson.newMastery || lesson.mastery) * 100)}
            />
            <Typography
                style={{
                    position: 'absolute',
                    padding: '16px',
                    left: 0,
                    bottom: 0,
                    zIndex: 10,
                }}
                variant='subtitle1'
            >
                {lesson.name}
            </Typography>
        </Card>
    );

    getSlide = () =>
        [-1, 0, 1].map(this.getGroup).map((group, gIndex) => {
            const slideGroup = group.map((lesson, LIndex) =>
                this.getCard(group, gIndex, lesson, LIndex),
            );
            return (
                <div
                    key={'group' + (gIndex + this.state.currentIndex)}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'absolute',
                        transition: 'transform 0.5s ease-in',
                        willChange: 'transform',
                        transform: `translateX(${100 * (gIndex - 1)}%)`,
                        width: '100%',
                        height: '100%',
                        zIndex: gIndex === 1 ? 2 : 1,
                    }}
                >
                    <div style={{flex: 1, padding: '5px 0', display: 'flex', flexDirection: 'row'}}>
                        {slideGroup.slice(0, 3)}
                    </div>
                    <div style={{flex: 1, padding: '5px 0', display: 'flex', flexDirection: 'row'}}>
                        {slideGroup.slice(3, 6)}
                    </div>
                </div>
            );
        });

    goToPreviousSlide = () => {
        if (this.state.currentIndex !== 0) {
            this.setState({currentIndex: this.state.currentIndex - 1});
        }
    };

    goToNextSlide = () => {
        if (this.state.currentIndex < Math.ceil(this.props.slides.length / 6) - 1) {
            this.setState({currentIndex: this.state.currentIndex + 1});
        }
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
                lesson.conceptID,
                res => {
                    console.log(res);
                    this.setState({currentLesson: {...lesson, data: {questions: [res]}}});
                },
                console.warn,
            );
        }
    };
    openLessonFSM = (lesson: AvoLesson, LIndex: string) => {
        this.setState({isEndTest: false});
        Http.getNextQuestion(
            lesson.conceptID,
            res => {
                console.log(res);
                this.setState({currentLesson: {...lesson, data: {questions: [res]}}});
                this.props.updateParentCurrentLesson(lesson);
                this.state.fsmRef.current.handleFSM(lesson, LIndex);
            },
            console.warn,
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

function getIconDisplay(preparation: number) {
    const {title, icon} = getIcon(preparation);
    return (
        <Tooltip title={title}>
            <IconButton
                disableRipple={true}
                style={{
                    position: 'absolute',
                    margin: '4px',
                    left: 0,
                    top: 0,
                    zIndex: 10,
                }}
            >
                {icon}
            </IconButton>
        </Tooltip>
    );
}

function getIcon(preparation: number): {title: string; icon: ReactElement} {
    preparation = Math.random();
    if (preparation < 0.25) {
        return {
            title: 'You need more preparation before attempting to learn this material',
            icon: <LockOutlined style={{color: red['500']}}/>
        };
    } else if (preparation < 0.5) {
        return {
            title: 'You should prepare more before learning this material',
            icon: <LockOutlined style={{color: orange['500']}}/>
        };
    } else if (preparation < 0.75) {
        return {
            title: 'You could prepare more, but this material should be okay',
            icon: <LockOpen style={{color: lightGreen['500']}}/>
        };
    } else {
        return {
            title: 'You are ready to learn this material',
            icon: <LockOpen style={{color: green['500']}}/>
        };
    }
}
