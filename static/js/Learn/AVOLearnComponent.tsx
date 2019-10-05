import React, {Component} from 'react';
import * as Http from '../Http';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import AVOLessonSlider from './AVOLessonSlider';
import { Slider } from '@material-ui/core';

export interface AvoLesson {
    mastery: number;
    newMastery: number;
    Tag: string;
    string: string;
    ID: number;
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
                }}
                id='avo-learn__layout-div'
            >
                {(this.state.lessons.length !== 0) && <AVOLessonSlider
                    theme={this.props.theme}
                    changeToNewMastery={() => this.changeToNewMastery()}
                    slides={this.state.lessons}
                    updateMastery={this.updateMastery}
                />}
                <div
                    style={{
                        borderRadius: '2.5em',
                        border: 'solid 1px black',
                        zIndex: 1000,
                        maxHeight: 75,
                        marginTop: 100,
                        padding: 15,
                    }}
                >
                    <TextField
                        id='filter-input'
                        label='Filter lessons...'
                        value={this.state.filterInput}
                        onChange={this.filterLessons}
                    />
                </div>
            </Grid>
        );
    }

    componentDidMount() {
        this.getLessons();
    }
    filterLessons = (e: any) => {
        const {allLessons} = this.state;
        const filterInput = e.target.value;
        if (filterInput === '') {
            this.setState({filterInput, lessons: allLessons});
        } else {
            const words = filterInput.split(' ');
            const lessons = allLessons.filter(lesson => words.indexOf(lesson.Tag) !== -1);
            this.setState({filterInput, lessons});
        }
    };
    getLessons = () => {
        Http.getLearnLessons(
            res => {
                console.log(res);
                this.setState({
                    lessons: res.lessons.map(x => ({...x, newMastery: x.mastery})),
                    allLessons: res.lessons.map(x => ({...x, newMastery: x.mastery})),
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
