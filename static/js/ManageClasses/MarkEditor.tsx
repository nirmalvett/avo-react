import React, {Component} from 'react';
import {Button} from '@material-ui/core';
import {Save} from '@material-ui/icons';
import * as Http from '../Http';
import {ShowSnackBar} from '../Layout/Layout';
import MarkEditorQuestionCard from './MarkEditorQuestionCard';

interface MarkEditorProps {
    showSnackBar: ShowSnackBar;
    takes: number;
}

interface MarkEditorState {
    questions: Http.PostTest_Question[];
}

export default class MarkEditor extends Component<MarkEditorProps, MarkEditorState> {
    constructor(props: MarkEditorProps) {
        super(props);
        this.state = {
            questions: [],
        };
    }

    componentDidMount() {
        Http.postTest(this.props.takes, this.onLoad, this.onLoadError);
    }

    onLoad = (result: Http.PostTest) => {
        this.setState(result);
        this.props.showSnackBar('info', 'Click on X or ✔ to change the mark. ', 5000);
    };

    onLoadError = () => {
        this.props.showSnackBar('error', 'Error loading quiz', 5000);
    };

    render() {
        return (
            <div
                style={{
                    flex: 1,
                    paddingLeft: '10%',
                    paddingRight: '10%',
                    paddingTop: '20px',
                    paddingBottom: '20px',
                    overflowY: 'auto',
                }}
            >
                {this.state.questions.map((x, y) => (
                    <MarkEditorQuestionCard
                        key={`QuestionCard-QIndex:${y}`}
                        question={x}
                        index={y}
                        update={this.updateQ}
                    />
                ))}
                <div style={{position: 'relative'}}>
                    <Button
                        variant='contained'
                        color='primary'
                        classes={{root: 'avo-generic__low-shadow'}}
                        style={{
                            position: 'fixed',
                            bottom: '3em',
                            right: '3em',
                            height: '4.5em',
                            width: '4.5em',
                            borderRadius: '50%',
                        }}
                        aria-label='Save'
                        onClick={this.saveChanges}
                    >
                        <Save />
                    </Button>
                </div>
            </div>
        );
    }

    updateQ = (questionIndex: number, partIndex: number) => () => {
        const newQuestions = [...this.state.questions]; // copy the question array
        const q = newQuestions[questionIndex]; // get the old question
        const newScores = [...q.scores]; // make a copy of the old question's scores
        newScores[partIndex] = newScores[partIndex] === 0 ? q.totals[partIndex] : 0;
        newQuestions[questionIndex] = {...q, scores: newScores}; // update the question in the array
        this.setState({questions: newQuestions});
    };

    saveChanges = () => {
        const scores = this.state.questions.map(q => q.scores);
        Http.changeMark(this.props.takes, scores, this.onSave, this.onSaveError);
    };

    onSave = () => this.props.showSnackBar('success', 'Marks successfully updated!', 2000);

    onSaveError = () =>
        this.props.showSnackBar(
            'error',
            'An issue occurred when saving to the server please try again.',
            2000,
        );
}
