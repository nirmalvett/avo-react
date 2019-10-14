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
import {GetSections_Section} from "../Http";

export interface AvoLesson {
    mastery: number;
    newMastery: number;
    Tag: string;
    string: string;
    ID: number;
    prereqs: {name: string; conceptID: number}[];
}

interface AVOLearnComponentProps {
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
    allLessons: AvoLesson[];
    filterInput: string;
    classNames: string[];
    classes: GetSections_Section[];
    selectedClass: GetSections_Section;
    selectedClassName: string;
    otherView: 'Completed' | 'To Do';
    postLessonModalDisplay: 'none' | 'block';
    currentLesson: AvoLesson;
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
            allLessons: [],
            classNames: [],
            classes: [],
            selectedClass: {} as GetSections_Section,
            selectedClassName: '',
            otherView: 'Completed',
            postLessonModalDisplay: 'none',
            currentLesson: {} as AvoLesson,
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
                    lesson={this.state.currentLesson}
                />
                <Grid item xs={3}>
                    <Button
                        variant='outlined'
                        style={{borderRadius: '2.5em'}}
                        onClick={() =>
                            this.setState({lessons: []}, () => {
                                const {allLessons, otherView} = this.state;
                                const lessons = allLessons.filter(lesson => {
                                    if (otherView === 'Completed') {
                                        return lesson.mastery > 0.85;
                                    } else {
                                        return lesson.mastery <= 0.85;
                                    }
                                });
                                console.log(otherView);
                                console.log(lessons);
                                this.setState({
                                    lessons,
                                    otherView: otherView === 'To Do' ? 'Completed' : 'To Do',
                                });
                            })
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
                            slides={this.state.lessons}
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
                                value={this.state.selectedClassName}
                                input={<Input name='data' id='select-class' />}
                                onChange={e =>
                                    this.setState(
                                        {selectedClassName: e.target.value as string},
                                        () => this.changeClass(),
                                    )
                                }
                            >
                                {this.state.classNames.map((c: any, i: number) => (
                                    <MenuItem key={i} value={c}>
                                        {c}
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
        Http.getSections(
            res => {
                console.log(res);
                const classes = res.sections;
                if (classes.length > 0) {
                    this.setState(
                        {
                            classNames: classes.map(c => c.name),
                            classes,
                            selectedClass: classes[0],
                            selectedClassName: classes[0].name,
                        },
                        () => this.changeClass(),
                    );
                }
            },
            err => {
                console.log(err);
            },
        );
    }
    setCurrentLesson = (currentLesson: AvoLesson) => {
        this.setState({currentLesson})
    }
    changeClass = () => {
        const {selectedClassName, classes} = this.state;
        if (selectedClassName !== 'Select class...') {
            const selectedClass = classes.find((c: GetSections_Section) => c.name === selectedClassName);
            if (selectedClass) {
                this.setState({selectedClass}, () => this.getLessons());
            }
        }
    };

    filterLessons = (e: any) => {
        const {allLessons} = this.state;
        const filterInput = e.target.value;
        if (filterInput === '') {
            this.setState({
                filterInput,
                lessons: allLessons.filter(lesson => {
                    if (this.state.otherView === 'Completed') {
                        return lesson.mastery < 0.85;
                    } else {
                        return lesson.mastery >= 0.85;
                    }
                }),
            });
        } else {
            const words = filterInput.split(' ');
            const lessons = allLessons
                .filter(lesson => words.indexOf(lesson.Tag) !== -1)
                .filter(lesson => {
                    if (this.state.otherView === 'Completed') {
                        return lesson.mastery < 0.85;
                    } else {
                        return lesson.mastery >= 0.85;
                    }
                });
            this.setState({filterInput, lessons});
        }
    };
    getLessons = () => {
        const {otherView} = this.state;
        console.log(otherView);
        Http.getNextLessons(
            this.state.selectedClass.sectionID, // todo
            res => {
                const {otherView} = this.state;
                console.log(otherView);
                console.log(res);
                const concepts = res.concepts;
                const lessons = concepts.map(concept => {
                    return {
                        ID: concept.conceptID,
                        Tag: concept.name,
                        mastery: concept.strength,
                        string: concept.lesson,
                        prereqs: concept.prereqs,
                    };
                });
                // const lessons = [
                //     {
                //         ID: 1,
                //         Tag: 'test',
                //         mastery: 0.3,
                //         string: 'whoohoo a lesson wao',
                //         prereqs: [{name: 'prereq oh boy', conceptID: 2}],
                //     },
                // ];
                this.setState({
                    lessons: lessons
                        .map(x => ({...x, newMastery: x.mastery}))
                        .filter(lesson => {
                            if (otherView === 'Completed') {
                                return lesson.mastery < 0.85;
                            } else {
                                return lesson.mastery >= 0.85;
                            }
                        }),
                    allLessons: lessons.map(x => ({...x, newMastery: x.mastery})),
                });
            },
            () => {},
        );
    };

    updateMastery = (mastery: number, id: number) => {
        console.log('Updating', id, mastery);
        if (mastery && id) {
            const lessons = this.state.lessons;
            const index = lessons.findIndex(lesson => lesson.ID === id);
            if (index !== -1) {
                lessons[index].newMastery = mastery;
                this.setState({
                    lessons,
                });
            }
        }
    };

    changeToNewMastery = () => {
        const lessons = this.state.lessons.map(lesson => {
            if (lesson.newMastery) {
                lesson.mastery = lesson.newMastery;
            }
            return lesson;
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
