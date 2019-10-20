import React from 'react';
import * as Http from '../Http';
import {AvoLesson, AvoLessonData} from './AVOLearnComponent';
import {Button} from '@material-ui/core';

const styles = {
    modalBackdrop: {
        position: 'fixed' as 'fixed',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 900000,
    },
    modalBody: {
        position: 'fixed' as 'fixed',
        top: '3em',
        bottom: '3em',
        right: '20%',
        left: '20%',
        padding: '2em 3em',
        backgroundColor: 'white',
        overflow: 'auto',
        zIndex: 900002,
    },
    modalClose: {
        cursor: 'pointer',
        marginLeft: 'auto',
    },
};

interface AVOLearnIncorrectAnswerModalProps {
    modalDisplay: 'block' | 'none';
    hideModal: () => void;
    lesson: AvoLesson & AvoLessonData
}

interface AVOLearnIncorrectAnswerModalState {
    selectedPrereqs: {name: string; conceptID: number}[];
}

export default class AVOLearnIncorrectAnswerModal extends React.Component<
    AVOLearnIncorrectAnswerModalProps,
    AVOLearnIncorrectAnswerModalState
> {
    constructor(props: any) {
        super(props);
        this.state = {
            selectedPrereqs: [],
        };
    }
    render() {
        console.log(this.props.lesson);
        return (
            <div>
                <div
                    style={{
                        display: this.props.modalDisplay,
                        zIndex: 900001,
                    }}
                    id='avo_learn_incorrect_answer_modal'
                >
                    <div style={styles.modalBackdrop} />
                    <div style={styles.modalBody}>
                        <button
                            onClick={this.props.hideModal}
                            style={styles.modalClose}
                            id='incorrect_answer_close'
                        >
                            Close
                        </button>
                        <h2>Where do you think you made the mistake?</h2>
                        {this.props.lesson.prereqs.concat({
                                name: this.props.lesson.name,
                                conceptID: this.props.lesson.conceptID,
                            }).map(prereq => (
                            <Button
                                onClick={() => {
                                    if (
                                        this.state.selectedPrereqs.findIndex(
                                            (p: any) => p.conceptID === prereq.conceptID,
                                        ) === -1
                                    ) {
                                        const {selectedPrereqs} = this.state;
                                        selectedPrereqs.push(prereq);
                                        this.setState({selectedPrereqs});
                                    } else {
                                        const {selectedPrereqs} = this.state;
                                        this.setState({
                                            selectedPrereqs: selectedPrereqs.filter(
                                                (p: any) => p.conceptID !== prereq.conceptID,
                                            ),
                                        });
                                    }
                                }}
                                variant={
                                    this.state.selectedPrereqs.findIndex(
                                        (p: any) => p.conceptID === prereq.conceptID,
                                    ) !== -1
                                        ? 'contained'
                                        : 'outlined'
                                }
                                style={{borderRadius: '2.5em'}}
                            >
                                {prereq.name}
                            </Button>
                        ))}
                        <br />
                        <Button
                            onClick={this.submitSurvey}
                            variant={'contained'}
                            style={{borderRadius: '2.5em'}}
                        >
                            Submit
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
    submitSurvey = () => {
        const {questions} = this.props.lesson.data;
        const {selectedPrereqs} = this.state;
        if (questions && questions.length > 0) {
            const question = questions[0];
            Http.wrongAnswerSurvey(
                question.ID,
                selectedPrereqs.map(x => x.conceptID),
                res => {
                    this.setState({selectedPrereqs: []});
                    if (selectedPrereqs.length > 0) this.props.hideModal();
                    console.log(res);
                },
                err => {
                    console.log(err);
                },
            );
        }
    };
}
