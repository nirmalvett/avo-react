import {getInitialData, getStudent, getTeacher } from "../../ServiceAPI/Server";
import { receiveStudent } from "./student";
import Http from "../../HelperFunctions/Http";
export const CONST_CREATE_TEST_GET_QUESTIONS = "CONST_CREATE_TEST_GET_QUESTIONS";
export const CONST_DEFAULT_TEST_SETTING = "CONST_DEFAULT_TEST_SETTING";
export const CONST_CREATE_TEST_OPEN_QUESTION_SET = "CONST_CREATE_TEST_OPEN_QUESTION_SET";

export function getQuestionSets(){
  return (dispatch) => {
      Http.getSets(
        (result) => {
             dispatch(getSetsAction(result))
        }
    );
  }
}

function getSetsAction(result){
  return {
    type: CONST_CREATE_TEST_GET_QUESTIONS,
    returnObject: result
  }
}

export function defaultMakeTestSettings(inputObject){
  return {
    type: CONST_DEFAULT_TEST_SETTING,
    returnObject: inputObject
  }
}

export function createTestOpenQuestionSet(questionIndex){
  /* indexQuestion: a valid index */
  return {
    type: CONST_CREATE_TEST_OPEN_QUESTION_SET,
    questionIndex: questionIndex
  }
}
