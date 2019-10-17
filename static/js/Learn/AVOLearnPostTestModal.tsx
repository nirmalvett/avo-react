import React, {Component, ReactElement} from 'react';
import * as Http from '../Http';
import {AvoLesson} from './AVOLearnComponent';
import Button from '@material-ui/core/Button';
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
        console.log(this.props.lesson);
        return (
            <div>
                <div
                    style={{
                        display: this.props.modalDisplay,
                        zIndex: 900001,
                    }}
                    id='avo_learn_post_lesson_modal'
                >
                    <div style={styles.modalBackdrop}></div>
                    <div style={styles.modalBody}>
                        <button
                            onClick={this.props.hideModal}
                            style={styles.modalClose}
                            id='post_test_close'
                        >
                            Close
                        </button>
                        <h2>How well do you know it now?</h2>
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            <Button
                                variant={
                                    this.state.selectedMastery === 1 ? 'contained' : 'outlined'
                                }
                                onClick={() => this.setState({selectedMastery: 1})}
                            >
                                1
                            </Button>
                            <Button
                                variant={
                                    this.state.selectedMastery === 2 ? 'contained' : 'outlined'
                                }
                                onClick={() => this.setState({selectedMastery: 2})}
                            >
                                2
                            </Button>
                            <Button
                                variant={
                                    this.state.selectedMastery === 3 ? 'contained' : 'outlined'
                                }
                                onClick={() => this.setState({selectedMastery: 3})}
                            >
                                3
                            </Button>
                            <Button
                                variant={
                                    this.state.selectedMastery === 4 ? 'contained' : 'outlined'
                                }
                                onClick={() => this.setState({selectedMastery: 4})}
                            >
                                4
                            </Button>
                            <Button
                                variant={
                                    this.state.selectedMastery === 5 ? 'contained' : 'outlined'
                                }
                                onClick={() => this.setState({selectedMastery: 5})}
                            >
                                5
                            </Button>
                        </div>
                        <h2>How easy was it for you to learn?</h2>
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            <Button
                                variant={
                                    this.state.selectedAptitude === 1 ? 'contained' : 'outlined'
                                }
                                onClick={() => this.setState({selectedAptitude: 1})}
                            >
                                1
                            </Button>
                            <Button
                                variant={
                                    this.state.selectedAptitude === 2 ? 'contained' : 'outlined'
                                }
                                onClick={() => this.setState({selectedAptitude: 2})}
                            >
                                2
                            </Button>
                            <Button
                                variant={
                                    this.state.selectedAptitude === 3 ? 'contained' : 'outlined'
                                }
                                onClick={() => this.setState({selectedAptitude: 3})}
                            >
                                3
                            </Button>
                            <Button
                                variant={
                                    this.state.selectedAptitude === 4 ? 'contained' : 'outlined'
                                }
                                onClick={() => this.setState({selectedAptitude: 4})}
                            >
                                4
                            </Button>
                            <Button
                                variant={
                                    this.state.selectedAptitude === 5 ? 'contained' : 'outlined'
                                }
                                onClick={() => this.setState({selectedAptitude: 5})}
                            >
                                5
                            </Button>
                        </div>
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
