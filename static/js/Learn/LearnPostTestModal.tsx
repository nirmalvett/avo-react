import React, {Component} from 'react';
import * as Http from '../Http';
import {AvoLesson} from './Learn';
import {Button, IconButton, Paper, Typography} from '@material-ui/core';
import {Close} from '@material-ui/icons';

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
        width: '50%',
        height: '45vh',
        padding: '2em 3em',
        borderRadius: '9px',
        overflow: 'auto',
        zIndex: 900002,
    },
    modalClose: {
        cursor: 'pointer',
    },
};

interface LearnPostTestModalProps {
    modalDisplay: 'block' | 'none';
    hideModal: () => void;
    lesson: AvoLesson;
}

interface LearnPostTestModalState {
    selectedMastery: number;
    selectedAptitude: number;
}

const masterySurvey = ['Not at all', 'A little bit', 'About half', 'Fairly well', 'Very well'];
const aptitudeSurvey = ['Very hard', 'Kinda hard', 'It was okay', 'Fairly easy', 'Very easy'];

export default class LearnPostTestModal extends Component<LearnPostTestModalProps,
    LearnPostTestModalState> {
    constructor(props: LearnPostTestModalProps) {
        super(props);
        this.state = {
            selectedMastery: -1,
            selectedAptitude: -1,
        };
    }

    render() {
        return (
            <div
                style={{
                    display: this.props.modalDisplay,
                    zIndex: 900001,
                }}
                id='avo_learn_post_lesson_modal'
            >
                <div style={styles.modalBackdrop}/>
                <Paper style={styles.modalBody} className='avo-card'>
                    <IconButton
                        onClick={this.props.hideModal}
                        style={{position: 'absolute', top: '9px', right: '9px'}}
                        id='post_test_close'
                    >
                        <Close/>
                    </IconButton>
                    <Typography variant={'h5'}>How well do you know the concept now?</Typography>
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                        {masterySurvey.map((label, index) => (
                            <ResponseButton
                                selected={this.state.selectedMastery === index + 1}
                                onClick={() => this.setState({selectedMastery: index + 1})}
                                buttonText={`${index + 1}`}
                                label={label}
                                key={'mastery-survey-' + index}
                            />
                        ))}
                    </div>
                    <Typography variant={'h5'}>How easy was it for you to learn?</Typography>
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                        {aptitudeSurvey.map((label, index) => (
                            <ResponseButton
                                selected={this.state.selectedAptitude === index + 1}
                                onClick={() => this.setState({selectedAptitude: index + 1})}
                                buttonText={`${index + 1}`}
                                label={label}
                                key={'aptitude-survey-' + index}
                            />
                        ))}
                    </div>
                    <br/>
                    <Button
                        onClick={this.submitSurvey}
                        variant={'contained'}
                        color={'primary'}
                        style={{
                            borderRadius: '2.5em',
                            position: 'absolute',
                            bottom: '9px',
                            right: '9px',
                        }}
                    >
                        Submit
                    </Button>
                </Paper>
            </div>
        );
    }

    submitSurvey = () => {
        const {selectedAptitude, selectedMastery} = this.state;
        const {lesson} = this.props;
        if (selectedAptitude !== -1 && selectedMastery !== -1) {
            Http.collectData(
                'post concept learn response',
                {lesson, selectedMastery, selectedAptitude},
                () => {
                },
                console.warn
            );
            this.setState({selectedAptitude: -1, selectedMastery: -1});
            this.props.hideModal();
        }
    };
}

function ResponseButton(props: {
    selected: boolean;
    onClick: () => void;
    buttonText: string;
    label: string;
}) {
    return (
        <div
            style={{
                flex: 1,
                padding: '9px',
                margin: '0% 4%',
            }}
        >
            <Button
                variant={props.selected ? 'contained' : 'outlined'}
                color={props.selected ? 'primary' : undefined}
                onClick={props.onClick}
            >
                {props.buttonText}
            </Button>
            <br/>
            <Typography variant={'body2'} style={{textAlign: 'center'}}>
                {props.label}
            </Typography>
        </div>
    );
}
