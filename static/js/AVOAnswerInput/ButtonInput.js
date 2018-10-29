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

import {getMathJax, sleep, validateMatrix, validateNumber, validateVector} from '../Utilities';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid/Grid';
import { copy } from "../Utilities";
import { CONST_CREATE_OBJECT, CONST_INPUT_PHASE, CONST_SHOW_OBJECT, CONST_SELECT_DIMENSION, CONST_VECTOR,
        CONST_VECTOR_LINEAR_EXPRESSION, CONST_BASIS, CONST_BOOLEAN, CONST_LINEAR_EXPRESSION,CONST_MANUAL_INPUT,
        CONST_MANUAL_INPUT_POLYNOMIAL, CONST_MATRIX, CONST_MULTIPLE_CHOICE, CONST_NUMBER
} from "./InputConsts";


const styles = theme => ({
  center: {
    flex: 1,
    margin:auto
  }
});

// ====================== The four phases which this component goes through ======================
// CREATE OBJECT PHASE: | Create Matrix |
// SELECT DIMENSION: Size of rows: ___________, Size of Columns: ______________ | Input Values |
// INPUT PHASE: ______  ______ _______ , ________  ________ __________ | Submit |
// SHOW OBJECT: | 1 2 3 | but in latex and in the correct orientation, there should also be a remove button

export default class ButtonInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          stage: CONST_CREATE_OBJECT,
          vectorSize: '',
          dimensionStorage: [], // [1,2] if vector, [1,2;3,4] if matrix
          type: this.props.type // this is the type of the input itself
        };
    }
    resetAll(){
      // This method resets the state back to the initial one and should be used once and then whenever user clicks clear
      this.setState({
        stage: CONST_CREATE_OBJECT,
        vectorSize: null, // if vector is being used then this should an int else it remains null
        dimensionStorage: null, // This will be [1, 2] for a vector and [1,2;3,4] for matrix,
        type: this.props.type // this is the type of the input itself
      });
      this.inputData = null;
    }
    render() {
      const { stage } = this.state;
        return (
              <div>
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
              </div>

        )

    }

    // ================================== General Four Phases ===========================================
    createObject() {
      const {type} = this.state;
      if (type === CONST_VECTOR) { return this.vectorCreateObject(); }
    }
    selectDimension(){
      const {type} = this.state;
      if (type === CONST_VECTOR){ return this.vectorSelectDimension(); }
    }
    inputPhase(){
      const {type} = this.state;
      if (type === CONST_VECTOR){ return this.vectorInputPhase(); }
    }
    showObject(){
      const {type} = this.state;
      if (type === CONST_VECTOR){ return this.vectorShowObject(); }
    }

    // ================================== Vector Input Logic ===========================================
    vectorCreateObject(){
      //  CREATE OBJECT PHASE: | Create Matrix |
      return (
           <Grid container
                  direction="column"
                  justify="center"
                  alignItems="center">
                <Button
                    variant="extendedFab"
                    color = "primary"
                    onClick = {() => this.setState({stage: CONST_SELECT_DIMENSION})}
                >
                  Create Vector
                </Button>
            </Grid>
      )
    }
    vectorSelectDimension(){
      // SELECT DIMENSION: Size of Rows: ___________, Size of Columns: ______________ | Input Values |
       return (
            <Grid container
                  direction="column"
                  justify="center"
                  alignItems="center">
              <TextField
                  label='Enter vector size.'
                  value = {this.state.vectorSize}
                  onChange = {(e) => this.handleVectorSize(e)}/>
              <br/>

             <Button
                  variant="extendedFab"
                  color = "primary"
                  onClick = {() => this.setState({stage: CONST_INPUT_PHASE})}
              >
                Confirm Dimension
              </Button>
            </Grid>
          )
    }
    vectorInputPhase(){
      // INPUT PHASE: ______  ______ _______ , ________  ________ __________ | Submit |
       const numberOfFields = this.state.vectorSize; // given by previous input
      const uniqueIds = []; // create an array of ids which we can use to map
      const stateObject = []; // We need something to hold all the input values in the state
      for (let i = 0; i < numberOfFields; i++){ // for the number of fields we need
        const idName = 'button-input-vector-' + (i);
        uniqueIds.push(idName);
        stateObject.push(''); // this will be a blank holder for all the objects
      }
      this.state.dimensionStorage = stateObject;

      return (
          <Grid container
                direction="column"
                justify="center"
                alignItems="center">

                { // We're mapping the vector inputs here
                  uniqueIds.map((idName, index) => {
                    return (
                      <div>
                      <TextField
                          id ={idName}
                          name = {`${index}-0` }
                          value = { this.state.dimensionStorage[index] }
                          onChange = {(e) => this.handleVectorInput(e)}
                          label={`Vector Parameter ${index + 1}` }
                      />
                        <br/>
                      </div>
                    )
                  })
                }
            <br/>
            <Button
                variant="extendedFab"
                color="primary"
                onClick={() => this.setState({stage: CONST_SHOW_OBJECT})}
            >
              Finish Answer
            </Button>
          </Grid>
      )
    }
    vectorShowObject(){
      // SHOW OBJECT: | 1 2 3 | but in latex and in the correct orientation, there should also be a remove button
       return (
           <Grid container
                  direction="column"
                  justify="center"
                  alignItems="center">
            { getMathJax("\\(\\begin{bmatrix}4\\\\3\\\\2\\end{bmatrix}\\)") }
            <br/> <br/>
             <Button
                variant="extendedFab"
                color = "primary"
                aria-label="Delete"
                onClick = {() => this.resetAll() }
            >
               Clear Answer
           </Button>
          </Grid>
      )
    }
    handleVectorSize(e){
      e.preventDefault();
      const value = e.target.value;
      // if only numbers are in the input then update
      if(RegExp('^[0-9]*$').test(value)){
        this.setState({vectorSize: parseInt(e.target.value)})
      }
    }
    handleVectorInput(e){
      e.preventDefault();
      const value = e.target.value; // the value the user inputs
      const name = e.target.name; // if the coordinates are 1, 2 then the string name will be 1-2
      const nameSplit = name.split("-");
      const x_value = parseInt(nameSplit[0]); // this will be the actual index
      const y_value = parseInt(nameSplit[1]); // this will always be set to 0, only here for the sake of reuse

      // if only numbers are in the input then update
      if(RegExp('^[0-9]*$').test(value)){
        const copyDimensionStorage = copy(this.state.dimensionStorage); // initially it'll look like ['', '', '']
        copyDimensionStorage[x_value] = value; // now if you push 1 in the first vector it's ['1'. '', '']
        console.log("copyDimensionStorage", copyDimensionStorage);
        this.setState({dimensionStorage: copyDimensionStorage});
        console.log("state after setState", this.state);
        this.state.dimensionStorage = copyDimensionStorage;
        console.log("state after this.state[dimensionStorage] = copyDimensionStorage", this.state);
      }
    }




}
