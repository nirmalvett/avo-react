import Http from "../../HelperFunctions/Http";


export const CONST_CREATE_TEST_GET_QUESTIONS = "CONST_CREATE_TEST_GET_QUESTIONS";
export const CONST_DEFAULT_TEST_SETTING = "CONST_DEFAULT_TEST_SETTING";
export const CONST_CREATE_TEST_OPEN_QUESTION_SET = "CONST_CREATE_TEST_OPEN_QUESTION_SET";
export const CONST_CREATE_TEST_ADD_QUESTION = "CONST_CREATE_TEST_ADD_QUESTION";
export const CONST_CREATE_TEST_DELETE_QUESTION = "CONST_CREATE_TEST_DELETE_QUESTION";
export const CONST_CREATE_TEST_REFRESH_QUESTION = "CONST_CREATE_TEST_REFRESH_QUESTION";
export const CONST_CREATE_TEST_LOCK_SEED = "CONST_CREATE_TEST_LOCK_SEED";
export const CONST_CREATE_TEST_NAME_FOR_TEST = "CONST_CREATE_TEST_NAME_FOR_TEST";
export const CONST_CREATE_TEST_ATTEMPT_LIMIT = "CONST_CREATE_TEST_ATTEMPT_LIMIT";
export const CONST_CREATE_TEST_TIME_LIMIT = "CONST_CREATE_TEST_TIME_LIMIT";
export const CONST_CREATE_TEST_AUTO_CLOSE = "CONST_CREATE_TEST_AUTO_CLOSE";
export const CONST_CRETE_TEST_AUTO_OPEN = "CONST_CRETE_TEST_AUTO_OPEN";

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

export function createTestOpenQuestionSet(questionIndex) {
  /* indexQuestion: a valid index */
  return {
	type: CONST_CREATE_TEST_OPEN_QUESTION_SET,
	questionIndex: questionIndex
  }
}

/**
 * [createTestQuestion either adds a new question or refreshes the seed]
 * @param  {Object} questionObj [questionObj that contains id and name]
 * @param  {int} indexToReplace [this is the index of the question to replace the seed for. -1 if it's a new question]
 * @return {Object}             [action object]
 */
export function createTestQuestion(questionObj, indexToReplace=-1) {
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
	  if (indexToReplace === -1){
	    dispatch(actionCreateTestAddQuestion(newQuestion));
	  }
	  else {
	    dispatch(actionCreateTestChangeQuestion(newQuestion, indexToReplace))
	  }



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

function actionCreateTestChangeQuestion(questionObj, indexToReplace){
  return {
    type: CONST_CREATE_TEST_REFRESH_QUESTION,
	newQuestion: questionObj,
	indexToReplace: indexToReplace,
  }
}


/**
 * [actionCreateTestDeleteQuestion]
 * @param  {int} index [index of the question to remove]
 * @return {object} object [action object]
 */
export function actionCreateTestDeleteQuestion(index){
	return {
		type: CONST_CREATE_TEST_DELETE_QUESTION,
		index: index,
	}
}

export function actionCreateTestLockSeed(index){
  return {
    type: CONST_CREATE_TEST_LOCK_SEED,
	index: index
  }
}

/**
 * [actionCreateTestDeleteQuestion]
 * @param  {string} testName [the name of the test in the form of a String]
 * @return {object} object [action object]
 */
export function actionCreateTestSetTestName(testName){
  return {
    type: CONST_CREATE_TEST_NAME_FOR_TEST,
	testName: testName,
  }
}

/**
 * [actionCreateAttemptLimit]
 * @param  {int} attemptInt [the amount of attempts]
 * @return {object} object [action object]
 */
export function actionCreateAttemptLimit(attemptInt){
  return {
    type: CONST_CREATE_TEST_ATTEMPT_LIMIT,
	attemptInt: attemptInt,
  }
}

/**
 * [actionCreateAttemptLimit]
 * @param  {int} minuteInt [the amount minutes]
 * @return {object} object [action object]
 */
export function actionCreateTimeLimit(minuteInt){
  return {
    type: CONST_CREATE_TEST_TIME_LIMIT,
	minuteInt: minuteInt,
  }
}

/**
 * [actionCreateAutoOpen]
 * @param  {date} date [the date opening time]
 * @return {object} object [action object]
 */
export function actionCreateAutoOpen(date){
  return {
    type: CONST_CRETE_TEST_AUTO_OPEN,
	date: date,
  }
}

/**
 * [actionCreateAutoClose]
 * @param  {date} date [the date opening time]
 * @return {object} object [action object]
 */
export function actionCreateAutoClose(date){
  return {
    type: CONST_CREATE_TEST_AUTO_CLOSE,
	date: date,
  }
}

/**
 * helper function takes the date object created by inline date picker and converts it to format expected by server
 * @param date Input is the date object given by inline date pick component
 * @return [String] date format for the server
 */
function convertDateToServerFormat(date) {
  const d = new Date(date);
  let _date =
	  ("00" + (d.getMonth() + 1)).slice(-2) + "" +
	  ("00" + d.getDate()).slice(-2) + "" +
	  ("00" + d.getHours()).slice(-2) + "" +
	  ("00" + d.getMinutes()).slice(-2) + "";
  _date = d.getFullYear() + "" + _date;
  return _date
}


