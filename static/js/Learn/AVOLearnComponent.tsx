import React, {Component} from 'react';
import * as Http from '../Http';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import AVOLessonSlider from './AVOLessonSlider';
import { Slider } from '@material-ui/core';

import {Class} from '../Models';

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
    classes: Class[];
    selectedClass: Class;
    selectedClassName: string;
    otherView: 'Completed' | 'To Do';
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
            selectedClass: {} as Class,
            selectedClassName: '',
            otherView: 'Completed',
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
                {this.state.lessons.length !== 0 && (
                    <AVOLessonSlider
                        theme={this.props.theme}
                        changeToNewMastery={() => this.changeToNewMastery()}
                        slides={this.state.lessons}
                        updateMastery={this.updateMastery}
                    />
                )}
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
                    <Grid item xs={6}></Grid>
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
        Http.getClasses(
            res => {
                console.log(res);
                const classes = res.classes;
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

    changeClass = () => {
        const {selectedClassName, classes} = this.state;
        if (selectedClassName !== 'Select class...') {
            const selectedClass = classes.find((c: Class) => c.name === selectedClassName);
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
        Http.getNextLessons(
            this.state.selectedClass.classID,
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
}
