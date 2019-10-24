import React from 'react';
import * as Http from '../Http';
import {Button, Typography, Paper, IconButton} from '@material-ui/core';
import {Close} from '@material-ui/icons';
import {AvoLesson} from "./AVOLearnComponent";

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
        height: '30vh',
        left: '20%',
        padding: '2em 3em',
        borderRadius: '9px',
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
    lesson: AvoLesson;
    questionID: number;
}

interface AVOLearnIncorrectAnswerModalState {
    selectedPrereqs: {name: string; conceptID: number}[];
}

export default class AVOLearnIncorrectAnswerModal extends React.Component<
    AVOLearnIncorrectAnswerModalProps,
    AVOLearnIncorrectAnswerModalState
> {
    constructor(props: AVOLearnIncorrectAnswerModalProps) {
        super(props);
        this.state = {
            selectedPrereqs: [],
        };
    }

    render() {
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
                    <Paper style={styles.modalBody}>
                        <IconButton
                            onClick={this.props.hideModal}
                            id='incorrect_answer_close'
                            style={{position: 'absolute', right: '8px', top: '8px'}}
                        >
                            <Close />
                        </IconButton>
                        <Typography variant={'h5'}>
                            Where do you think you made the mistake?
                        </Typography>
                        <Typography variant={'body2'}>Select all areas that apply</Typography>
                        <br />
                        <br />
                        {this.props.lesson.prereqs
                            .concat({
                                name: this.props.lesson.name,
                                conceptID: this.props.lesson.conceptID,
                            })
                            .map(prereq => (
                                <Button
                                    onClick={() => {
                                        if (
                                            this.state.selectedPrereqs.findIndex(
                                                p => p.conceptID === prereq.conceptID,
                                            ) === -1
                                        ) {
                                            const {selectedPrereqs} = this.state;
                                            selectedPrereqs.push(prereq);
                                            this.setState({selectedPrereqs});
                                        } else {
                                            const {selectedPrereqs} = this.state;
                                            this.setState({
                                                selectedPrereqs: selectedPrereqs.filter(
                                                    p => p.conceptID !== prereq.conceptID,
                                                ),
                                            });
                                        }
                                    }}
                                    variant={
                                        this.state.selectedPrereqs.findIndex(
                                            p => p.conceptID === prereq.conceptID,
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
                        <br />
                        <Button
                            onClick={this.submitSurvey}
                            variant={'contained'}
                            color={'primary'}
                            style={{
                                borderRadius: '2.5em',
                                position: 'absolute',
                                bottom: '8px',
                                right: '8px',
                            }}
                        >
                            Submit
                        </Button>
                    </Paper>
                </div>
            </div>
        );
    }

    submitSurvey = () => {
        const {selectedPrereqs} = this.state;
        Http.wrongAnswerSurvey(
            this.props.questionID,
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
    };
}
