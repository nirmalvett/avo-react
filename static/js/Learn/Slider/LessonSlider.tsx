import React, {Component} from 'react';
import {Button, IconButton, Input, MenuItem, Select, TextField, Typography} from '@material-ui/core';
import {ChevronLeft, ChevronRight} from '@material-ui/icons';
import {AvoLesson} from '../AVOLearnComponent';
import {PageSlider} from './PageSlider';
import {LessonGroup} from './LessonGroup';
import {ThemeObj} from '../../Models';
import {Course} from "../../Http/types";
import {sortFunc} from "../../HelperFunctions/Utilities";

interface LessonSliderProps {
    courses: Course[]
    onClick: (lesson: AvoLesson) => void;
    lessons: AvoLesson[];
    theme: ThemeObj;
    selectedCourse: number;
    changeCourse: (courseID: number) => void;
}

interface LessonSliderState {
    mode: 'Completed' | 'To Do';
    filterInput: string;
    currentIndex: number;
}

export default class LessonSlider extends Component<LessonSliderProps, LessonSliderState> {
    constructor(props: LessonSliderProps) {
        super(props);
        this.state = {
            mode: 'To Do',
            filterInput: '',
            currentIndex: 0
        };
    }

    getLessonsToShow() {
        let lessons = this.props.lessons;
        if (this.state.filterInput !== '') {
            const words = this.state.filterInput.split(' ');
            lessons = lessons.filter(lesson => words.every(word => lesson.name.includes(word)));
        }
        const isCompleted = this.state.mode === 'Completed';
        return lessons
            .filter(lesson => isCompleted === lesson.mastery >= 0.85)
            .sort(sortFunc(x => -x.preparation));
    }

    render() {
        const lessons = this.getLessonsToShow();
        if (lessons.length === 0) {
            return (
                <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Typography variant='h3'>No lessons to display</Typography>
                </div>
            );
        }
        return (
            <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                <div
                    style={{flex: 1, display: 'flex', flexDirection: 'row'}}
                    id='avo-lesson__layout-div'
                >
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
                            onClick={this.back}
                            color='primary'
                            disabled={this.disableBack()}
                        >
                            <ChevronLeft />
                        </IconButton>
                    </div>
                    <div style={{flex: 1, position: 'relative'}}>
                        {this.renderTopBar()}
                        <LessonGroup
                            groups={[-1, 0, 1].map(this.getGroup)}
                            theme={this.props.theme}
                            onClick={this.props.onClick}
                            currentPage={this.state.currentIndex}
                        />
                    </div>
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
                            onClick={this.next}
                            color='primary'
                            disabled={this.disableNext()}
                        >
                            <ChevronRight />
                        </IconButton>
                    </div>
                </div>
                <PageSlider
                    color='primary'
                    valueLabelDisplay='auto'
                    aria-label='avo page slider'
                    min={0}
                    max={this.pageCount() - 1}
                    onChange={this.sliderChange}
                    style={{zIndex: 2}}
                    value={this.state.currentIndex}
                    valueLabelFormat={this.formatLabel}
                />
            </div>
        );
    }

    renderTopBar() {
        return (
            <div
                style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}
            >
                <div style={{display: 'flex', flexDirection: 'row'}}>
                    <Button
                        variant='outlined'
                        style={{
                            borderRadius: '2.5em',
                            marginLeft: '4px',
                            marginRight: '2ch',
                        }}
                        onClick={this.toggleView}
                    >
                        View {this.state.mode === 'To Do' ? 'Completed' : 'To Do'}
                    </Button>
                    <TextField
                        id='filter-input'
                        label='Filter lessons...'
                        value={this.state.filterInput}
                        onChange={this.filterLessons}
                    />
                </div>
                <Select
                    value={this.props.selectedCourse}
                    input={<Input name='data' id='select-class' />}
                    style={{marginRight: '4px'}}
                    onChange={e => this.props.changeCourse(e.target.value as number)}
                >
                    {this.props.courses.map((c, i) => (
                        <MenuItem key={i} value={c.courseID}>
                            {c.name}
                        </MenuItem>
                    ))}
                </Select>
            </div>
        );
    }

    toggleView = () => this.setState({
        mode: this.state.mode === 'To Do' ? 'Completed' : 'To Do',
        currentIndex: 0,
    });

    filterLessons = (e: any) => this.setState({
        filterInput: e.target.value,
        currentIndex: 0,
    });

    formatLabel = () => {
        const startIndex = this.state.currentIndex * 6;
        const range = this.getGroup().length;
        if (range === 1) {
            return `${startIndex + 1}`;
        } else {
            return `${startIndex + 1} - ${startIndex + range}`;
        }
    };

    getGroup = (index = 0) => {
        const idx = this.state.currentIndex + index;
        return this.getLessonsToShow().slice(6 * idx, 6 * (idx + 1));
    };

    pageCount() {
        return Math.ceil(this.getLessonsToShow().length / 6);
    }

    disableBack() {
        return this.state.currentIndex <= 0;
    }

    disableNext() {
        return this.state.currentIndex >= this.pageCount() - 1;
    }

    back = () => this.setState({currentIndex: this.state.currentIndex - 1});

    next = () => this.setState({currentIndex: this.state.currentIndex + 1});

    sliderChange = (_: any, value: number | number[]) =>
        this.setState({currentIndex: value as number});
}
