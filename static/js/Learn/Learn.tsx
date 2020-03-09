import React, {Component} from 'react';
import * as Http from '../Http';
import LessonSlider from './Slider/LessonSlider';
import LearnPostTestModal from './LearnPostTestModal';
import {Course} from '../Http/types';
import LearnTestComp from './LearnModal/LearnTestComp';
import {ThemeObj} from '../Models';
import {HashLoader} from 'react-spinners';
import FullScreenModal from './LearnModal/FullScreenModal';
import {ShowSnackBar, SnackbarVariant} from '../Layout/Layout';

export interface AvoLesson {
    conceptID: number;
    preparation: number;
    mastery: number;
    name: string;
    lesson: string;
    prereqs: {name: string; conceptID: number}[];
    masterySurvey: number;
    aptitudeSurvey: number;
}

export interface AvoLessonData {
    prompt: string;
    prompts: string[];
    types: string[];
    ID: number;
    seed: number;
}

interface Concept {
    readonly conceptID: number;
    readonly name: string;
    readonly lesson: string;
    type: number;
}

interface Edge {
    readonly child: number;
    readonly parent: number;
    readonly weight: number;
}

interface LearnProps {
    courses: Course[];
    updateCourses: (courses: Course[], cb?: () => void) => void;
    theme: ThemeObj;
    showSnackBar: ShowSnackBar;
}

interface LearnState {
    lessons: AvoLesson[];
    selectedCourse: number;
    postLessonModalDisplay: 'none' | 'block';
    currentLesson: AvoLesson | undefined;
    isLoading: boolean;
    needUpdate: boolean;
    concepts: Concept[];
    edges: Edge[];
    closedLesson: AvoLesson | undefined;
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
            needUpdate: false,
            edges: [],
            concepts: [],
            closedLesson: undefined,
        };
    }

    componentDidMount(): void {
        if (this.props.courses && this.props.courses.length > 0) {
            this.setState({isLoading: false});
            this.changeCourse(this.props.courses[0].courseID);
        } else Http.getCourses(({courses}) => this.props.updateCourses(courses), console.warn);
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
                <FullScreenModal
                    sourceID={this.getSourceID()}
                    currentLesson={this.state.currentLesson as AvoLesson}
                    onClose={this.closeLessonFSM}
                    concepts={this.state.concepts}
                    edges={this.state.edges}
                    theme={this.props.theme}
                    lessons={this.state.lessons}
                >
                    {this.state.currentLesson && (
                        <LearnTestComp
                            key={(this.state.currentLesson || {conceptID: 0}).conceptID}
                            lesson={this.state.currentLesson}
                            updateMastery={this.updateMastery}
                            theme={this.props.theme}
                            survey={this.updateSurvey}
                            showSnackBar={this.props.showSnackBar}
                            closeFSM={() => {
                                const lessonConceptID: number = ({
                                    ...this.state.currentLesson,
                                } as AvoLesson).conceptID;
                                this.updateMastery({[lessonConceptID]: 1});
                                this.setState({currentLesson: undefined});
                            }}
                        />
                    )}
                </FullScreenModal>
                <LearnPostTestModal
                    hideModal={this.hidePostLessonModal}
                    modalDisplay={this.state.postLessonModalDisplay}
                    lesson={this.state.closedLesson as AvoLesson}
                />
                <LessonSlider
                    onClick={this.openLessonFSM}
                    key={'LessonSlider' + this.state.selectedCourse}
                    theme={this.props.theme}
                    lessons={this.state.lessons}
                    courses={this.props.courses}
                    selectedCourse={this.state.selectedCourse}
                    changeCourse={this.changeCourse}
                    reloadLessons={this.reloadLessons}
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
        Http.collectData('change course learn', {courseID}, () => {}, console.warn);
        this.setState({isLoading: true}, () => {
            Http.getNextLessons(
                courseID,
                res => {
                    const lessons = res.lessons;
                    Http.getConceptGraph(
                        courseID, //this.state.selectedClass.classID,
                        res => {
                            this.setState({
                                concepts: res.concepts,
                                edges: res.edges,
                                selectedCourse: courseID,
                                lessons,
                                isLoading: false,
                            });
                        },
                        console.warn,
                    );
                },
                console.warn,
            );
        });
    };

    reloadLessons = () => {
        this.setState({isLoading: true}, () => {
            Http.getNextLessons(
                this.state.selectedCourse,
                res => {
                    const lessons = res.lessons;
                    Http.getConceptGraph(
                        this.state.selectedCourse,
                        res => {
                            this.setState({
                                concepts: res.concepts,
                                edges: res.edges,
                                selectedCourse: this.state.selectedCourse,
                                lessons,
                                isLoading: false,
                            });
                        },
                        console.warn,
                    );
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
        this.setState({lessons, needUpdate: true});
    };

    updateSurvey = (masterySurvey: number, aptitudeSurvey: number) => () => {
        const lesson = this.state.currentLesson as AvoLesson;
        this.setState({
            currentLesson: {...lesson, masterySurvey, aptitudeSurvey},
            needUpdate: true,
        });
    };

    showPostLessonModal = () => this.setState({postLessonModalDisplay: 'block'});

    hidePostLessonModal = () =>
        this.setState({postLessonModalDisplay: 'none', closedLesson: undefined});

    openLessonFSM = (lesson: AvoLesson) => {
        this.setState({currentLesson: lesson});
        Http.collectData('open learn lesson', {lesson}, () => {}, console.warn);
    };

    closeLessonFSM = () => {
        const lesson = this.state.currentLesson;
        Http.collectData('close learn lesson', {lesson}, () => {}, console.warn);
        this.showPostLessonModal();
        this.setState({currentLesson: undefined, closedLesson: lesson});
        if (this.state.needUpdate) {
            Http.getNextLessons(
                this.state.selectedCourse,
                res => this.setState({...res, needUpdate: false}),
                console.warn,
            );
        }
    };
}
