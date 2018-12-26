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
    componentDidMount() {
        Http.postTest(this.props.takes, result => {
            this.markButtonMarkers = result.questions.map((question) => {
                // {question.scores[y]}/{question.totals[y]}
                const questionSegments = question.explanation.map((explanation, idx) => {
                    return question.scores[idx];
                });
                return questionSegments;
            });
            this.setState({
              questions : result.questions,
            });
            this.props.showSnackBar('info', "Click on X or ✔ to change the mark. ", 5000);
        }, () => {});
    }

    render() {
      console.log(this.state);
        return (
            <Grid container spacing={8}>
                <Grid xs={1}/>
                <Grid xs={10} style={{marginTop: '20px', marginBottom: '20px', overflowY: 'auto'}}>
                  { this.getEachQuestionCard() }
                </Grid>
                <Grid xs={1}/>
                { this.saveButton() }

            </Grid>
        );
    }

    saveChanges(){
     Http.changeMark(
        this.props.takes, // this is the takes number
        convertArrayForServer(this.markButtonMarkers, this.state.questions), // this needs to be converted so it's not 0,1s but actual marks
        (result) => {
            console.log(result);
            this.props.showSnackBar('success', "Marks successfully updated!");
        },
        (error) => {
          console.log(error);
          this.props.showSnackBar('error', "An issue occurred when saving to the server please try again.");
        }
      );
    }

    saveButton(){
      return (
          <div style={{ position : 'relative' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        classes={{ root : 'avo-generic__low-shadow' }}
                        style={{ position: 'fixed', bottom: '3em', right: '3em', height: '4.5em', width: '4.5em', borderRadius: '50%' }}
                        aria-label="Save"
                        onClick={() => { this.saveChanges() }}>
                        <Save />
                    </Button>
            </div>
      )
    }

    getEachQuestionCard(){
      return (
          <React.Fragment>
             {
                this.state.questions.map((x, y) => <MarkEditorQuestionCard
                                                      qMarks={this.markButtonMarkers[y]}
                                                      index={y}
                                                      question={x}
                                                      markButtonMarkers={this.markButtonMarkers}
                                                  />
            )}
          </React.Fragment>
      )
    }


}

function convertArrayForServer(markButtonMarkers, markWorthsArray){
  /* markButtonMarkers: [1, 0, 0] where 1 means full mark and 0 means not
  * markWorthsArray: [0.25, 0.25, 0,25] where each array is the worth of the marks
  *
  * returns an array of of the marks given for example [0.25, 0, 0]*/
  console.log("markButtonMarkers", markButtonMarkers);
  console.log("markWorthsArray", markWorthsArray);

  const returnArray = [];
  for (let i = 0; i < markWorthsArray.length; i++){
    returnArray.push(
        markButtonMarkers[i] === 1 // if it's marked correctly then get the marks worth otherwise have it return 0
            ? markWorthsArray[i]
            : 0
    )
  }
  return returnArray;
}

