import {getInitialData, getStudent, getTeacher } from "../../ServiceAPI/Server";
import { receiveStudent } from "./student";
import Http from "../../HelperFunctions/Http";
export const CONST_MAKE_TEST_SETS = "CONST_MAKE_TEST_SETS";
export const CONST_DEFAULT_TEST_SETTING = "CONST_DEFAULT_TEST_SETTING";

export function handleLoginData(returnObject){
    return {
        type: CONST_USER_LOGIN_DATA,
        returnObject: returnObject
    }
}

export function initialMakeTest(){

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
    type: CONST_MAKE_TEST_SETS,
    returnObject: result
  }
}

export function defaultMakeTestSettings(inputObject){
  return {
    type: CONST_DEFAULT_TEST_SETTING,
    returnObject: inputObject
  }
}

