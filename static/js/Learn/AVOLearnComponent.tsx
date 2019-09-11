import React, {Component} from 'react';
import * as Http from '../Http';
import Grid from '@material-ui/core/Grid';
import AVOLessonSlider from './AVOLessonSlider';

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
}

export default class AVOLearnComponent extends Component<
    AVOLearnComponentProps,
    AVOLearnComponentState
> {
    constructor(props: AVOLearnComponentProps) {
        super(props);
        this.state = {
            lessons: [],
        };
    }

    render() {
        if (this.state.lessons.length === 0) return <div />;
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
                <AVOLessonSlider
                    theme={this.props.theme}
                    changeToNewMastery={() => this.changeToNewMastery()}
                    slides={this.state.lessons}
                    updateMastery={this.updateMastery}
                />
            </Grid>
        );
    }

    componentDidMount() {
        this.getLessons();
    }
    getLessons = () => {
        Http.getLearnLessons(
            res => {
                console.log(res);
                this.setState({lessons: res.lessons.map(x => ({...x, newMastery: x.mastery}))});
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
