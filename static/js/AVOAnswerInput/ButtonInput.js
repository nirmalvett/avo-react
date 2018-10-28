import React from 'react';
import FormControlLabel from "@material-ui/core/FormControlLabel/FormControlLabel";
import Radio from "@material-ui/core/Radio/Radio";
import TextField from "@material-ui/core/TextField/TextField";
import Typography from "@material-ui/core/Typography/Typography";
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import Icon from '@material-ui/core/Icon';
import DeleteIcon from '@material-ui/icons/Delete';
import NavigationIcon from '@material-ui/icons/Navigation';
import {green} from '@material-ui/core/colors';
import { CONST_VECTOR, CONST_VECTOR_LINEAR_EXPRESSION} from "./AnswerInput";
import {getMathJax, sleep, validateMatrix, validateNumber, validateVector} from '../Utilities';
const styles = theme => ({
  center: {
    flex: 1,
    margin:auto
  }
});

const CONST_CREATE_OBJECT = 1; // | Create Matrix |
const CONST_SELECT_DIMENSION = 2; // Size of rows: ___________, Size of Columns: ______________ | Input Values |
const CONST_INPUT_PHASE = 3; // ______  ______ _______ , ________  ________ __________ | Submit |
const CONST_SHOW_OBJECT = 4; // | 1 2 3 | but in latex and in the correct orientation, there should also be a remove button

export default class ButtonInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          stage: CONST_CREATE_OBJECT,
          vectorSize: ''
        }
    }

    render() {
      const { stage } = this.state;
        return (
            <div style={{ flex: 1 }}>
              <center>
                {
                  stage === CONST_CREATE_OBJECT
                      ?  this.createObject() // if True then render create object button i.e. "Create Vector"
                      : stage === CONST_SELECT_DIMENSION
                        ? this.selectDimension() // if True then render dimensions selector i.e. "Row: _____ Column: _______"
                        : stage === CONST_INPUT_PHASE
                          ? this.inputPhase() // If True then render fields for the student to fill in
                          : stage === CONST_SHOW_OBJECT
                              ? this.showObject() //If true then show the answer in latex
                              : null
                }
              </center>
            </div>
        )

    }

    createObject(){
      const { type } = this.props;
      if (type === CONST_VECTOR || CONST_VECTOR_LINEAR_EXPRESSION){
        return (
            <Button
                variant="extendedFab"
                color = "primary"
                aria-label="Delete"
                onClick = {() => this.setState({stage: CONST_SELECT_DIMENSION})}
            >
              Create Vector
            </Button>
        )
      }
    }

    selectDimension(){
      return (
          <div>
            <input label='Enter vector' value = {this.state.vectorSize} onChange = {(e) => this.handleVectorSize(e)}/>
           <Button
                variant="extendedFab"
                color = "primary"
                aria-label="Delete"
                onClick = {() => this.setState({stage: CONST_INPUT_PHASE})}
            >
              Confirm Dimension
            </Button>
          </div>
      )
    }

    inputPhase(){
      return (
           <Button
                variant="extendedFab"
                color = "primary"
                aria-label="Delete"
                onClick = {() => this.setState({stage: CONST_SHOW_OBJECT})}
            >
              Finish Answer
            </Button>
      )
    }

    showObject(){
      return (
          <div>
            { getMathJax("\\(\\begin{bmatrix}4\\\\3\\\\2\\end{bmatrix}\\)") }
            { getMathJax("\\(\\\\ \\\\ \\\\ \\)") }
             <Button
                variant="extendedFab"
                color = "primary"
                aria-label="Delete"
                onClick = {() => this.setState({stage: CONST_CREATE_OBJECT})}
            >
               Clear Answer
           </Button>
          </div>
      )
    }

    // Handlers for Dimension Selection
    handleVectorSize(e){
      e.preventDefault();
      const value = e.target.value;
      // if only numbers are in the input then update
      if(RegExp('^[0-9]*$').test(value)){
        this.setState({vectorSize: e.target.value})
      }

    }



}
