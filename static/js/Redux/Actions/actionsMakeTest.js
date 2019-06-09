import {getInitialData, getStudent, getTeacher} from "../../ServiceAPI/Server";
import {receiveStudent} from "./actionsStudent";
import Http from "../../HelperFunctions/Http";
import {copy} from "../../HelperFunctions/Utilities";

export const CONST_CREATE_TEST_GET_QUESTIONS = "CONST_CREATE_TEST_GET_QUESTIONS";
export const CONST_DEFAULT_TEST_SETTING = "CONST_DEFAULT_TEST_SETTING";
export const CONST_CREATE_TEST_OPEN_QUESTION_SET = "CONST_CREATE_TEST_OPEN_QUESTION_SET";
export const CONST_CREATE_TEST_ADD_QUESTION = "CONST_CREATE_TEST_ADD_QUESTION";

export function getQuestionSets() {
  return (dispatch) => {
	Http.getSets(
		(result) => {
		  dispatch(getSetsAction(result))
		}
	);
  }
}

function getSetsAction(result) {
  return {
	type: CONST_CREATE_TEST_GET_QUESTIONS,
	returnObject: result
  }
}

export function defaultMakeTestSettings(inputObject) {
  return {
	type: CONST_DEFAULT_TEST_SETTING,
	returnObject: inputObject
  }
}

export function createTestOpenQuestionSet(questionIndex) {
  /* indexQuestion: a valid index */
  return {
	type: CONST_CREATE_TEST_OPEN_QUESTION_SET,
	questionIndex: questionIndex
  }
}

export function createTestAddQuestion(questionObj) {
  return (dispatch) => {
	const seed = Math.floor(Math.random() * 65536);
	Http.getQuestion(questionObj.id, seed, (result) => {
	  const newQuestion = {
		id: questionObj.id,
		name: questionObj.name,
		seed: seed,
		locked: false,
		prompt: result.prompt,
		prompts: result.prompts,
		types: result.types
	  };

	  dispatch(actionCreateTestAddQuestion(newQuestion));


	}, () => {
	});
  }
}

function actionCreateTestAddQuestion(questionObj) {
  return {
	type: CONST_CREATE_TEST_ADD_QUESTION,
	newQuestion: questionObj
  }
}