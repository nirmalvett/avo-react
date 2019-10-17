import React, {Component} from 'react';
import * as Http from '../Http';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import AVOLessonSlider from './AVOLessonSlider';

import AVOLearnPostTestModel from './AVOLearnPostTestModal';
import {Course} from "../Http/types";

export interface AvoLesson {
    conceptID: number;
    mastery: number;
    newMastery: number;
    name: string;
    lesson: string;
    prereqs: {name: string; conceptID: number}[];
}

interface AVOLearnComponentProps {
    courses: Course[];
    updateCourses: (courses: Course[], cb?: () => void) => void;
    theme: {
        theme: 'light' | 'dark';
        color: {
            '100': string;
            '200': string;
            '500': string;
        };
    };
}

interface AVOLearnComponentState {
    lessons: AvoLesson[];
    filterInput: string;
    selectedCourse: number;
    otherView: 'Completed' | 'To Do';
    postLessonModalDisplay: 'none' | 'block';
    currentLesson: number;
}

export default class AVOLearnComponent extends Component<
    AVOLearnComponentProps,
    AVOLearnComponentState
> {
    constructor(props: AVOLearnComponentProps) {
        super(props);
        this.state = {
            lessons: [],
            filterInput: '',
            selectedCourse: -1,
            otherView: 'Completed',
            postLessonModalDisplay: 'none',
            currentLesson: -1,
        };
    }

    render() {
        return (
            <Grid
                container
                xs={12}
                style={{
                    flex: 1,
                    display: 'flex',
                    paddingBottom: 0,
                    padding: '1em',
                    position: 'relative',
                    width: '98% !important',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                }}
                id='avo-learn__layout-div'
            >
                <AVOLearnPostTestModel
                    hideModal={this.hidePostLessonModal}
                    modalDisplay={this.state.postLessonModalDisplay}
                    lesson={this.state.lessons.find(x => x.conceptID === this.state.currentLesson) as AvoLesson}
                />
                <Grid item xs={3}>
                    <Button
                        variant='outlined'
                        style={{borderRadius: '2.5em'}}
                        onClick={() =>
                            this.setState({otherView: this.state.otherView === 'To Do' ? 'Completed' : 'To Do'})
                        }
                    >
                        View {this.state.otherView}
                    </Button>
                </Grid>
                <Grid container xs={12}>
                    {this.state.lessons.length !== 0 && (
                        <AVOLessonSlider
                            theme={this.props.theme}
                            changeToNewMastery={() => this.changeToNewMastery()}
                            slides={this.state.lessons /*todo*/}
                            updateMastery={this.updateMastery}
                            showPostLessonModal={this.showPostLessonModal}
                            updateParentCurrentLesson={this.setCurrentLesson}
                        />
                    )}
                </Grid>
                <Grid container xs={12} style={{marginTop: 150}}>
                    <Grid item xs={3}>
                        <div
                            style={{
                                borderRadius: '2.5em',
                                border: 'solid 1px black',
                                padding: 15,
                            }}
                        >
                            <TextField
                                id='filter-input'
                                style={{width: '100%'}}
                                label='Filter lessons...'
                                value={this.state.filterInput}
                                onChange={this.filterLessons}
                            />
                        </div>
                    </Grid>
                    <Grid item xs={6} />
                    <Grid item xs={3}>
                        <div
                            style={{
                                marginLeft: 'auto',
                                borderRadius: '2.5em',
                                border: 'solid 1px black',
                                padding: 15,
                            }}
                        >
                            <Select
                                style={{width: '100%'}}
                                value={this.state.selectedCourse}
                                input={<Input name='data' id='select-class' />}
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
                    </Grid>
                </Grid>
            </Grid>
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
            },
            err => {
                console.log(err);
            },
        );
    }

    setCurrentLesson = (currentLesson: AvoLesson) => {
        this.setState({currentLesson: currentLesson.conceptID});
    };

    changeClass = () => {
        if (this.state.selectedCourse !== -1) {
            const selectedCourse = this.props.courses.find(c => c.courseID === this.state.selectedCourse);
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
                this.setState({selectedCourse: courseID, lessons});
            },
            console.warn,
        );
    };

    updateMastery = (mastery: number, id: number) => {
        console.log('Updating', id, mastery);
        if (mastery && id) {
            const lessons = [...this.state.lessons];
            const index = lessons.findIndex(lesson => lesson.conceptID === id);
            if (index !== -1) {
                lessons[index] = {...lessons[index], newMastery: mastery};
                this.setState({lessons});
            }
        }
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
}
