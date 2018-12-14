import React from 'react';
import Http from './Http';
import Button from '@material-ui/core/Button';
import Grid from "@material-ui/core/Grid/Grid";
import Save from '@material-ui/icons/Save';
import MarkEditorQuestionCard from './MarkEditorQuestionCard';

export default class MarkEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            questions: [],
        };
        this.markButtonMarkers = [];
    }

    render() {
        return (
            <Grid container spacing={8}>
                <Grid xs={1}/>
                <Grid xs={10} style={{marginTop: '20px', marginBottom: '20px', overflowY: 'auto'}}>
                    {this.state.questions.map((x, y) => <MarkEditorQuestionCard 
                                                            qMarks={this.markButtonMarkers[y]}
                                                            index={y}
                                                            question={x}
                                                            markButtonMarkers={this.markButtonMarkers}
                                                        />
                    )}
                </Grid>
                <Grid xs={1}/>
                <div style={{ position : 'relative' }}>
                    <Button variant="contained" color="primary" classes={{ root : 'avo-generic__low-shadow' }} style={{ position: 'fixed', bottom: '3em', right: '3em', height: '4.5em', width: '4.5em', borderRadius: '50%' }} aria-label="Save" onClick={() => {
                        Http.changeMark(
                            this.props.takes,
                            this.markButtonMarkers,
                            (result) => {
                                console.log(result);
                            },
                            () => {}
                        );
                    }}>
                        <Save />
                    </Button>
                </div>
            </Grid>
        );
    }

    componentDidMount() {
        Http.postTest(this.props.takes, result => {
            this.markButtonMarkers = result.questions.map((question) => {
                // {question.scores[y]}/{question.totals[y]}
                const questionSegments = question.explanation.map((explanation, idx) => {
                    return question.scores[idx];
                });
                return questionSegments;
            });
            this.setState({ questions : result.questions });
            console.log(this);
        }, () => {});
    }
}