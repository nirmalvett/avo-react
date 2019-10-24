import React, {Component} from 'react';
import * as Http from '../Http';
import {Button, Input, MenuItem, Select, TextField} from '@material-ui/core';
import LessonSlider from './Slider/LessonSlider';

import LearnPostTestModal from './LearnPostTestModal';
import {Course} from '../Http/types';
import AVOLearnTestComp from './AVOLearnTestComp';
import AVOLessonFSM from './AVOLessonFSM';
import {ThemeObj} from '../Models';
import {HashLoader} from 'react-spinners';
import {sortFunc} from '../HelperFunctions/Utilities';

export interface AvoLesson {
    conceptID: number;
    preparation: number;
    mastery: number;
    newMastery: number;
    name: string;
    lesson: string;
    prereqs: {name: string; conceptID: number}[];
}

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

interface AVOLearnComponentProps {
    courses: Course[];
    updateCourses: (courses: Course[], cb?: () => void) => void;
    theme: ThemeObj;
}

interface AVOLearnComponentState {
    fsmRef: {current: AVOLessonFSM};
    lessons: AvoLesson[];
    filterInput: string;
    selectedCourse: number;
    otherView: 'Completed' | 'To Do';
    postLessonModalDisplay: 'none' | 'block';
    currentLesson: AvoLesson & AvoLessonData;
    isEndTest: boolean;
    isLoading: boolean;
}

export default class AVOLearnComponent extends Component<
    AVOLearnComponentProps,
    AVOLearnComponentState
> {
    constructor(props: AVOLearnComponentProps) {
        super(props);
        this.state = {
            fsmRef: React.createRef() as {current: AVOLessonFSM},
            lessons: [],
            filterInput: '',
            selectedCourse: -1,
            otherView: 'To Do',
            postLessonModalDisplay: 'none',
            currentLesson: {} as AvoLesson & AvoLessonData,
            isEndTest: false,
            isLoading: true,
        };
    }

    getLessonsToShow() {
        let lessons = this.state.lessons;
        if (this.state.filterInput !== '') {
            const words = this.state.filterInput.split(' ');
            lessons = lessons.filter(lesson => words.every(word => lesson.name.includes(word)));
        }
        const isCompleted = this.state.otherView === 'Completed';
        return lessons
            .filter(lesson => isCompleted === lesson.mastery >= 0.85)
            .sort(sortFunc(x => -x.preparation));
    }

    render() {
        const lessons = this.getLessonsToShow();
        if (this.state.isLoading) {
            return (
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <HashLoader size={150} color={'#399103'} />
                </div>
            );
        }

        return (
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    paddingBottom: 0,
                    padding: '1em',
                    position: 'relative',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                }}
            >
                <AVOLessonFSM
                    changeToNewMastery={this.changeToNewMastery}
                    showPostLessonModal={this.showPostLessonModal}
                    isEndTest={this.state.isEndTest}
                    ref={this.state.fsmRef}
                >
                    {this.state.currentLesson && (
                        <AVOLearnTestComp
                            lesson={this.state.currentLesson}
                            updateMastery={this.updateMastery}
                            theme={this.props.theme}
                            setEndTest={this.setEndTest}
                            getNewQuestion={this.getNewQuestion}
                        />
                    )}
                </AVOLessonFSM>
                <LearnPostTestModal
                    hideModal={this.hidePostLessonModal}
                    modalDisplay={this.state.postLessonModalDisplay}
                    lesson={
                        this.state.lessons.find(
                            x => x.conceptID === this.state.currentLesson.conceptID,
                        ) as AvoLesson
                    }
                />
                <div
                    style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}
                >
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                        <Button
                            variant='outlined'
                            style={{
                                borderRadius: '2.5em',
                                marginLeft: '6ch',
                                marginRight: '2ch' /*todo*/,
                            }}
                            onClick={() =>
                                this.setState({
                                    otherView:
                                        this.state.otherView === 'To Do' ? 'Completed' : 'To Do',
                                })
                            }
                        >
                            View {this.state.otherView === 'To Do' ? 'Completed' : 'To Do'}
                        </Button>
                        <TextField
                            id='filter-input'
                            label='Filter lessons...'
                            value={this.state.filterInput}
                            onChange={this.filterLessons}
                        />
                    </div>
                    <Select
                        value={this.state.selectedCourse}
                        input={<Input name='data' id='select-class' />}
                        style={{marginRight: '6ch' /*todo*/}}
                        onChange={e =>
                            this.setState(
                                {selectedCourse: e.target.value as number},
                                this.changeClass,
                            )
                        }
                    >
                        {this.props.courses.map((c, i) => (
                            <MenuItem key={i} value={c.courseID}>
                                {c.name}
                            </MenuItem>
                        ))}
                    </Select>
                </div>
                {lessons.length !== 0 && (
                    <LessonSlider
                        onClick={this.openLessonFSM}
                        key={'LessonSlider' + lessons.length}
                        theme={this.props.theme}
                        lessons={lessons}
                    />
                )}
            </div>
        );
    }

    componentDidMount() {
        this.getClasses();
    }

    getClasses() {
        Http.getCourses(
            res => {
                console.log(res);
                const courses = res.courses;
                if (courses.length > 0) {
                    this.setState({selectedCourse: courses[0].courseID}, this.changeClass);
                }
                this.setState({isLoading: false});
            },
            err => {
                console.log(err);
            },
        );
    }
    componentDidUpdate(preProps: AVOLearnComponentProps, prevState: AVOLearnComponentState) {
        if (preProps.courses !== this.props.courses) {
            if (this.props.courses.length > 0)
                this.setState({selectedCourse: this.props.courses[0].courseID}, () =>
                    this.changeClass(),
                );
        }
    }

    changeClass = () => {
        if (this.state.selectedCourse !== -1) {
            const selectedCourse = this.props.courses.find(
                c => c.courseID === this.state.selectedCourse,
            );
            if (selectedCourse) {
                this.getLessons(selectedCourse.courseID);
            }
        }
    };

    filterLessons = (e: any) => this.setState({filterInput: e.target.value});

    getLessons = (courseID: number) => {
        Http.getNextLessons(
            this.state.selectedCourse,
            res => {
                const lessons = res.lessons.map(concept => ({
                    ...concept,
                    newMastery: concept.mastery,
                }));
                this.setState({selectedCourse: courseID, lessons, isLoading: false});
            },
            console.warn,
        );
    };

    updateMastery = (mastery: {[conceptID: number]: number}) => {
        const lessons = [...this.state.lessons];
        for (let conceptID in mastery) {
            const index = lessons.findIndex(lesson => lesson.conceptID === Number(conceptID));
            if (index !== -1) {
                lessons[index] = {...lessons[index], newMastery: mastery[conceptID]};
            }
        }
        this.setState({lessons});
    };

    changeToNewMastery = () => {
        const lessons = this.state.lessons.map(lesson => {
            if (lesson.newMastery) {
                return {...lesson, mastery: lesson.newMastery};
            } else {
                return lesson;
            }
        });
        this.setState({lessons});
    };

    showPostLessonModal = () => {
        this.setState({postLessonModalDisplay: 'block'});
    };
    hidePostLessonModal = () => {
        this.setState({postLessonModalDisplay: 'none'});

        // const modal = document.getElementById('avo_learn_post_lesson_modal');
        // if (modal) {
        //     event.preventDefault();
        //     modal.style.display = 'none';
        // } else {
        //     console.log('oh no');
        // }
    };

    openLessonFSM = (lesson: AvoLesson) => {
        this.setState({isEndTest: false});
        Http.getNextQuestion(
            lesson.conceptID,
            res => {
                this.setState({currentLesson: {...lesson, data: {questions: [res]}}});
                this.state.fsmRef.current.handleFSM(lesson);
            },
            () => {
                // @ts-ignore todo
                this.setState({currentLesson: lesson});
                this.state.fsmRef.current.handleFSM(lesson);
            },
        );
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

    setEndTest = () => {
        this.setState({isEndTest: true});
    };
}
