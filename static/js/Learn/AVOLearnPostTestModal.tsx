import React from 'react';
import * as Http from '../Http';
import {AvoLesson} from './AVOLearnComponent';
import {Button, Paper, IconButton, Typography} from '@material-ui/core';
import {
    Close
} from '@material-ui/icons';

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

export default class AVOLearnPostTestModel extends React.Component<
    {modalDisplay: 'block' | 'none'; hideModal: () => void; lesson: AvoLesson},
    any
> {
    constructor(props: any) {
        super(props);
        this.state = {
            selectedMastery: -1,
            selectedAptitude: -1,
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
                    id='avo_learn_post_lesson_modal'
                >
                    <div style={styles.modalBackdrop} />
                    <Paper style={styles.modalBody} className="avo-card">
                        <IconButton
                            onClick={this.props.hideModal}
                            style={{ position : 'absolute', top : '9px', right : '9px' }}
                            id='post_test_close'
                        >
                            <Close/>
                        </IconButton>
                        <Typography variant={'h5'}>How well do you know the concept now?</Typography>
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            <div style={{ flex : 1, padding : '9px', margin : '0% 4%', borderRadius : '2.5em' }}>
                                <Button
                                    variant={
                                        this.state.selectedMastery === 1 ? 'contained' : 'outlined'
                                    }
                                    color={this.state.selectedMastery === 1 ? 'primary' : undefined}
                                    onClick={() => this.setState({selectedMastery: 1})}
                                >
                                    1
                                </Button>
                                <br/>
                                <Typography variant={'body2'} style={{ textAlign : 'center' }}>Not at all</Typography>
                            </div>
                            <div style={{ flex : 1, padding : '9px', margin : '0% 4%', borderRadius : '2.5em' }}>
                                <Button
                                    variant={
                                        this.state.selectedMastery === 2 ? 'contained' : 'outlined'
                                    }
                                    color={this.state.selectedMastery === 2 ? 'primary' : undefined}
                                    onClick={() => this.setState({selectedMastery: 2})}
                                >
                                    2
                                </Button>
                                <br/>
                                <Typography variant={'body2'} style={{ textAlign : 'center' }}>Somewhat</Typography>
                            </div>
                            <div style={{ flex : 1, padding : '9px', margin : '0% 4%', borderRadius : '2.5em' }}>
                                <Button
                                    variant={
                                        this.state.selectedMastery === 3 ? 'contained' : 'outlined'
                                    }
                                    color={this.state.selectedMastery === 3 ? 'primary' : undefined}
                                    onClick={() => this.setState({selectedMastery: 3})}
                                >
                                    3
                                </Button>
                                <br/>
                                <Typography variant={'body2'} style={{ textAlign : 'center' }}>Mostly</Typography>
                            </div>
                            <div style={{ flex : 1, padding : '9px', margin : '0% 4%', borderRadius : '2.5em' }}>
                                <Button
                                    variant={
                                        this.state.selectedMastery === 4 ? 'contained' : 'outlined'
                                    }
                                    color={this.state.selectedMastery === 4 ? 'primary' : undefined}
                                    onClick={() => this.setState({selectedMastery: 4})}
                                >
                                    4
                                </Button>
                                <br/>
                                <Typography variant={'body2'} style={{ textAlign : 'center' }}>Fairly Well</Typography>
                            </div>
                            <div style={{ flex : 1, padding : '9px', margin : '0% 4%', borderRadius : '2.5em' }}>
                                <Button
                                    variant={
                                        this.state.selectedMastery === 5 ? 'contained' : 'outlined'
                                    }
                                    color={this.state.selectedMastery === 5 ? 'primary' : undefined}
                                    onClick={() => this.setState({selectedMastery: 5})}
                                >
                                    5
                                </Button>
                                <br/>
                                <Typography variant={'body2'} style={{ textAlign : 'center' }}>Very Well</Typography>
                            </div>
                        </div>
                        <Typography variant={'h5'}>How easy was it for you to learn?</Typography>
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            <div style={{ flex : 1, padding : '9px', margin : '0% 4%', borderRadius : '2.5em' }}>
                                <Button
                                    variant={
                                        this.state.selectedAptitude === 1 ? 'contained' : 'outlined'
                                    }
                                    color={this.state.selectedAptitude === 1 ? 'primary' : undefined}
                                    onClick={() => this.setState({selectedAptitude: 1})}
                                >
                                    1
                                </Button>
                                <br/>
                                <Typography variant={'body2'} style={{ textAlign : 'center' }}>Not at all</Typography>
                            </div>
                            <div style={{ flex : 1, padding : '9px', margin : '0% 4%', borderRadius : '2.5em' }}>
                                <Button
                                    variant={
                                        this.state.selectedAptitude === 2 ? 'contained' : 'outlined'
                                    }
                                    color={this.state.selectedAptitude === 2 ? 'primary' : undefined}
                                    onClick={() => this.setState({selectedAptitude: 2})}
                                >
                                    2
                                </Button>
                                <br/>
                                <Typography variant={'body2'} style={{ textAlign : 'center' }}>Somewhat</Typography>
                            </div>
                            <div style={{ flex : 1, padding : '9px', margin : '0% 4%', borderRadius : '2.5em' }}>
                                <Button
                                    variant={
                                        this.state.selectedAptitude === 3 ? 'contained' : 'outlined'
                                    }
                                    color={this.state.selectedAptitude === 3 ? 'primary' : undefined}
                                    onClick={() => this.setState({selectedAptitude: 3})}
                                >
                                    3
                                </Button>
                                <br/>
                                <Typography variant={'body2'} style={{ textAlign : 'center' }}>I got most of it</Typography>
                            </div>
                            <div style={{ flex : 1, padding : '9px', margin : '0% 4%', borderRadius : '2.5em' }}>
                                <Button
                                    variant={
                                        this.state.selectedAptitude === 4 ? 'contained' : 'outlined'
                                    }
                                    color={this.state.selectedAptitude === 4 ? 'primary' : undefined}
                                    onClick={() => this.setState({selectedAptitude: 4})}
                                >
                                    4
                                </Button>
                                <br/>
                                <Typography variant={'body2'} style={{ textAlign : 'center' }}>Fairly Easy</Typography>
                            </div>
                            <div style={{ flex : 1, padding : '9px', margin : '0% 4%', borderRadius : '2.5em' }}>
                                <Button
                                    variant={
                                        this.state.selectedAptitude === 5 ? 'contained' : 'outlined'
                                    }
                                    color={this.state.selectedAptitude === 5 ? 'primary' : undefined}
                                    onClick={() => this.setState({selectedAptitude: 5})}
                                >
                                    5
                                </Button>
                                <br/>
                                <Typography variant={'body2'} style={{ textAlign : 'center' }}>Very Easy</Typography>
                            </div>
                        </div>
                        <br />
                        <Button
                            onClick={this.submitSurvey}
                            variant={'contained'}
                            color={'primary'}
                            style={{borderRadius: '2.5em', position : 'absolute', bottom : '9px', right : '9px' }}
                        >
                            Submit
                        </Button>
                    </Paper>
                </div>
            </div>
        );
    }
    submitSurvey = () => {
        const {selectedAptitude, selectedMastery} = this.state;
        if (selectedAptitude !== -1 && selectedMastery !== -1) {
            Http.postQuestionSurvey(
                this.props.lesson.conceptID,
                selectedMastery,
                selectedAptitude,
                res => {
                    console.log(res);
                    this.props.hideModal();
                },
                err => {
                    console.log(err);
                },
            );
        }
        this.setState({selectedAptitude: -1, selectedMastery: -1});
    };
}
