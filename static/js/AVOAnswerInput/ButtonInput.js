import React from 'react';
import TextField from "@material-ui/core/TextField/TextField";
import Button from '@material-ui/core/Button';
import {getMathJax, sleep, validateMatrix, validateNumber, validateVector} from '../Utilities';
import Grid from '@material-ui/core/Grid/Grid';
import { copy } from "../Utilities";
import { CONST_CREATE_OBJECT, CONST_INPUT_PHASE, CONST_SHOW_OBJECT, CONST_SELECT_DIMENSION, CONST_VECTOR,
        CONST_VECTOR_LINEAR_EXPRESSION, CONST_BASIS, CONST_BOOLEAN, CONST_LINEAR_EXPRESSION,CONST_MANUAL_INPUT,
        CONST_MANUAL_INPUT_POLYNOMIAL, CONST_MATRIX, CONST_MULTIPLE_CHOICE, CONST_NUMBER
} from "./InputConsts";
import Snackbar from '@material-ui/core/Snackbar';
import Slide from '@material-ui/core/Slide';
import { objectSize } from "../helpers";
import Typography from '@material-ui/core/Typography/Typography';
function TransitionUp(props) {
  return <Slide {...props} direction="up" />;
}


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
          dimensionStorage: {}, // [1,2] if vector, [1,2;3,4] if matrix
          type: this.props.type, // this is the type of the input itself,
          message: '',
          totalFields: -1, // this should be an int where a 3 by 3 matrix is 9 fields that a student must fill,
          disabled: this.props.disabled, // if true then the starting input should be disabled
        };
    }
    resetAll(){
      // This method resets the state back to the initial one and should be used once and then whenever user clicks clear
      this.setState({
        stage: CONST_CREATE_OBJECT,
        vectorSize: null, // if vector is being used then this should an int else it remains null
        dimensionStorage: {}, // This will be [1, 2] for a vector and [1,2;3,4] for matrix,
        type: this.props.type, // this is the type of the input itself
        totalFields: -1 // this should be an int where a 3 by 3 matrix is 9 fields that a student must fill
      });
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
              <br/>
              <Typography color='error'>{this.state.message}</Typography>
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
                    disabled = { this.state.disabled }
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
                  onClick = {(e) => this.handleVectorDimensionSubmit(e)}
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
      const stateObject = {}; // We need something to hold all the input values in the state
      for (let i = 0; i < numberOfFields; i++){ // for the number of fields we need
        const idName = 'button-input-vector-' + (i);
        uniqueIds.push(idName);
        stateObject[i] = ''; // this will be a blank holder for all the objects
      }
      if (this.state.dimensionStorage === {}){ // We this check otherwise it'll keep wiping the input
        this.state.dimensionStorage = stateObject;
      }


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
                          key = {idName}
                          name = {`${index}-0` }
                          value = { this.state.dimensionStorage[index]}
                          onChange = {(e) => this.handleVectorInput(e)}
                          label={`Vector Parameter ${index + 1}` }
                          error={!Array.isArray(validateNumber(this.state.dimensionStorage[index]))}
                          helperText={!Array.isArray(validateNumber(this.state.dimensionStorage[index]))
                              ? validateNumber(this.state.dimensionStorage[index])
                              : undefined}

                      />
                        <br/>
                        <br/>
                      </div>
                    )
                  })
                }
            <br/>
            <Button
                variant="extendedFab"
                color="primary"
                onClick={(e) => {this.handleFinishAnswer(e)}}
            >
              Finish Answer
            </Button>
          </Grid>
      )
    }
    vectorShowObject(){
      // SHOW OBJECT: | 1 2 3 | but in latex and in the correct orientation, there should also be a remove button
      // Now we just we just need to accumulate the vector latex to show students
      let vectorLatex = "\\(\\begin{bmatrix}";
      const { dimensionStorage } = this.state;
      console.log(this.state);
      const keyArray = Object.keys(dimensionStorage);
      console.log(keyArray);

      for (let i = 0; i < keyArray.length; i++){
        const value = dimensionStorage[keyArray[i]];
        console.log(value);
        vectorLatex += value + "\\\\";
      };
      vectorLatex += "\\end{bmatrix}\\)";
       return (
           <Grid container
                  direction="column"
                  justify="center"
                  alignItems="center">
            { getMathJax(vectorLatex) }
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
      // If the value is nothing then set it back
      if (value === ""){
        this.setState({vectorSize: "", totalFields: -1})
      }
      // if only numbers are in the input then update
      else if(value !== "" && RegExp('^[0-9]*$').test(value)){
        const integerValue = parseInt(value);
        this.setState({vectorSize: integerValue, totalFields: integerValue})
      }
    }
    handleVectorDimensionSubmit(e){

      if (this.state.totalFields === -1){
        this.setState({message: 'Looks like you forget to indicate a vector size.'})
      }
      else {
        this.setState({message: '', stage: CONST_INPUT_PHASE})
      }
    }
    handleVectorInput(e){
      e.preventDefault();
      const value = e.target.value; // the value the user inputs
      const name = e.target.name; // if the coordinates are 1, 2 then the string name will be 1-2
      const nameSplit = name.split("-");
      const x_value = parseInt(nameSplit[0]); // this will be the actual index
      const y_value = parseInt(nameSplit[1]); // this will always be set to 0, only here for the sake of reuse
      const dimensionStorage = this.state.dimensionStorage;
      dimensionStorage[x_value] = value;
      this.setState(dimensionStorage);

    }

    // ==================================== Global Methods ==============================================
    handleFinishAnswer(e){
      e.preventDefault();
      const { dimensionStorage, totalFields } = this.state;
      // CASE 0: The user did not give any inputs or one of the inputs is missing
      if(!allFieldsFilled(dimensionStorage, totalFields)){
        this.setState({ message: 'Looks like you forget to fill in field.',})
      }
      // CASE 1: We can go ahead and show the object compiled
      else{
        this.setState({stage: CONST_SHOW_OBJECT, message: ''})
      }
    }





}
function allFieldsFilled(dimensionStorage, totalFields){
  // CASE 0: The user did not input any object or it's not the right size
  const objectSizeInt = objectSize(dimensionStorage);
  if (objectSizeInt === 0 ||  objectSizeInt !== totalFields){
    return false;
  }
  // Checks if all the fields are filled
  for (let x in dimensionStorage) {
    if (!dimensionStorage.hasOwnProperty(x)) continue;// skip loop if the property is from prototype
    const currentObject = dimensionStorage[x];
    // CASE 1: It's a vector so we just check the first level
    if ( typeof currentObject === "string" && currentObject === ""){
      return false;
    }
    // CASE 2: It's a Matrix or Basis so we need to check the values inside of it
    else {
      for (let y in currentObject){
        if (!currentObject.hasOwnProperty(y)) continue;// skip loop if the property is from prototype
        const secondLevelObject = currentObject[y];
        if (secondLevelObject === ""){
          return false;
        }
      }
    }
  }
  return true;
}
