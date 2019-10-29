import React, {Component} from 'react';
import * as Http from '../Http';
import LessonSlider from './Slider/LessonSlider';
import LearnPostTestModal from './LearnPostTestModal';
import {Course} from '../Http/types';
import LearnTestComp from './LearnModal/LearnTestComp';
import {ThemeObj} from '../Models';
import {HashLoader} from 'react-spinners';
import FullScreenModal from './LearnModal/FullScreenModal';

export interface AvoLesson {
    conceptID: number;
    preparation: number;
    mastery: number;
    name: string;
    lesson: string;
    prereqs: {name: string; conceptID: number}[];
}

export interface AvoLessonData {
    prompt: string;
    prompts: string[];
    types: string[];
    ID: number;
    seed: number;
}

interface LearnProps {
    courses: Course[];
    updateCourses: (courses: Course[], cb?: () => void) => void;
    theme: ThemeObj;
}

interface LearnState {
    lessons: AvoLesson[];
    selectedCourse: number;
    postLessonModalDisplay: 'none' | 'block';
    currentLesson: AvoLesson | undefined;
    isLoading: boolean;
}

export default class Learn extends Component<LearnProps, LearnState> {
    constructor(props: LearnProps) {
        super(props);
        this.state = {
            lessons: [],
            selectedCourse: -1,
            postLessonModalDisplay: 'none',
            currentLesson: undefined,
            isLoading: true,
        };
    }

    componentDidMount(): void {
        Http.getCourses(({courses}) => this.props.updateCourses(courses), console.warn);
    }

    getSourceID() {
        if (this.state.currentLesson) {
            return `avo-lesson__card-${this.state.currentLesson.conceptID}`;
        }
    }

    render() {
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
                    <HashLoader size={150} color='#399103' />
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
                <FullScreenModal sourceID={this.getSourceID()} onClose={this.closeLessonFSM}>
                    {this.state.currentLesson && (
                        <LearnTestComp
                            onClose={this.closeLessonFSM}
                            key={(this.state.currentLesson || {conceptID: 0}).conceptID}
                            lesson={this.state.currentLesson}
                            updateMastery={this.updateMastery}
                            theme={this.props.theme}
                        />
                    )}
                </FullScreenModal>
                <LearnPostTestModal
                    hideModal={this.hidePostLessonModal}
                    modalDisplay={this.state.postLessonModalDisplay}
                    lesson={this.state.currentLesson as AvoLesson}
                />
                <LessonSlider
                    onClick={this.openLessonFSM}
                    key={'LessonSlider' + this.state.selectedCourse}
                    theme={this.props.theme}
                    lessons={this.state.lessons}
                    courses={this.props.courses}
                    selectedCourse={this.state.selectedCourse}
                    changeCourse={this.changeCourse}
                />
            </div>
        );
    }

    componentDidUpdate(prevProps: LearnProps, prevState: LearnState) {
        if (prevProps.courses !== this.props.courses) {
            if (this.props.courses.length) {
                this.changeCourse(this.props.courses[0].courseID);
            } else {
                this.setState({isLoading: false});
            }
        }
    }

    changeCourse = (courseID: number) => {
        this.setState({isLoading: true}, () => {
            Http.getNextLessons(
                courseID,
                res => {
                    const lessons = res.lessons;
                    this.setState({selectedCourse: courseID, lessons, isLoading: false});
                },
                console.warn,
            );
        });
    };

    updateMastery = (mastery: {[conceptID: number]: number}) => {
        const lessons = [...this.state.lessons];
        for (let conceptID in mastery) {
            const index = lessons.findIndex(lesson => lesson.conceptID === Number(conceptID));
            if (index !== -1) {
                lessons[index] = {...lessons[index], mastery: mastery[conceptID]};
            }
        }
        this.setState({lessons});
        Http.getNextLessons(this.state.selectedCourse, res => this.setState(res), console.warn);
    };

    showPostLessonModal = () => this.setState({postLessonModalDisplay: 'block'});

    hidePostLessonModal = () => this.setState({postLessonModalDisplay: 'none'});

    openLessonFSM = (lesson: AvoLesson) => this.setState({currentLesson: lesson});

    closeLessonFSM = () => this.setState({currentLesson: undefined});
}
