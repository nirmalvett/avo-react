import React, {Component} from 'react';
import {IconButton} from '@material-ui/core';
import {ChevronLeft, ChevronRight} from '@material-ui/icons';
import {AvoLesson} from '../AVOLearnComponent';
import {PageSlider} from './PageSlider';
import {LessonGroup} from './LessonGroup';
import {ThemeObj} from '../../Models';

interface AVOLessonSliderProps {
    onClick: (lesson: AvoLesson) => void;
    lessons: AvoLesson[];
    theme: ThemeObj;
}

interface AVOLessonSliderState {
    currentIndex: number;
}

export default class AVOLessonSlider extends Component<AVOLessonSliderProps, AVOLessonSliderState> {
    constructor(props: AVOLessonSliderProps) {
        super(props);
        this.state = {currentIndex: 0};
    }

    render() {
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
        return this.props.lessons.slice(6 * idx, 6 * (idx + 1));
    };

    pageCount() {
        return Math.ceil(this.props.lessons.length / 6);
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
