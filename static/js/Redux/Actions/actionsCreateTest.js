import * as Http from '../../Http';

export const CONST_CREATE_TEST_ADD_CLASS_ID = "CONST_CREATE_TEST_ADD_CLASS_ID";
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
export const CONST_CREATE_TEST_TOGGLE_CLOSE_TIME = "CONST_CREATE_TEST_TOGGLE_CLOSE_TIME";
export const CONST_CREATE_TEST_TOGGLE_ATTEMPT_LIMIT = "CONST_CREATE_TEST_TOGGLE_ATTEMPT_LIMIT";
export const CONST_CREATE_TEST_TOGGLE_OPEN_TIME = "CONST_CREATE_TEST_TOGGLE_OPEN_TIME";
export const CONST_CREATE_TEST_TOGGLE_TIME_LIMIT = "CONST_CREATE_TEST_TOGGLE_TIME_LIMIT";
export const CONST_CREATE_TEST_SUBMIT_TEST = "CONST_CREATE_TEST_SUBMIT_TEST";



/**
 *
 * @param id
 * @returns {{id: *, type: string}}
 */
export function actionCreateTestAddClassId(id){
  return {
    type: CONST_CREATE_TEST_ADD_CLASS_ID,
	id: id
  }
}

export function getQuestionSets () {
  return (dispatch) => {
	Http.getSets (
		(result) => {
		  dispatch (getSetsAction (result))
		}
	);
  }
}

function getSetsAction (result) {
  return {
	type: CONST_CREATE_TEST_GET_QUESTIONS,
	returnObject: result
  }
}

export function createTestOpenQuestionSet (questionIndex) {
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
export function createTestQuestion (questionObj, indexToReplace = -1) {
  return (dispatch) => {
	const seed = Math.floor (Math.random () * 65536);
	Http.getQuestion (questionObj.id, seed, (result) => {
	  const newQuestion = {
		id: questionObj.id,
		name: questionObj.name,
		seed: seed,
		locked: false,
		prompt: result.prompt,
		prompts: result.prompts,
		types: result.types
	  };
	  if (indexToReplace === -1) {
		dispatch (actionCreateTestAddQuestion (newQuestion));
	  } else {
		dispatch (actionCreateTestChangeQuestion (newQuestion, indexToReplace))
	  }


	}, () => {
	});
  }
}

function actionCreateTestAddQuestion (questionObj) {
  return {
	type: CONST_CREATE_TEST_ADD_QUESTION,
	newQuestion: questionObj
  }
}

function actionCreateTestChangeQuestion (questionObj, indexToReplace) {
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
export function actionCreateTestDeleteQuestion (index) {
  return {
	type: CONST_CREATE_TEST_DELETE_QUESTION,
	index: index,
  }
}

/**
 * creates the test lock seed action
 * @param index [int]
 * @returns {{index: [int], type: string}}
 */
export function actionCreateTestLockSeed (index) {
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
export function actionCreateTestSetTestName (testName) {
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
export function actionCreateAttemptLimit (attemptInt) {
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
export function actionCreateTimeLimit (minuteInt) {
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
export function actionCreateAutoOpen (date) {
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
export function actionCreateAutoClose (date) {
  return {
	type: CONST_CREATE_TEST_AUTO_CLOSE,
	date: date,
  }
}

/**
 * Function toggles whether or not close time is shown
 * @returns {{type: string}}
 */
export function actionCreateTestToggleCloseTime(){
  return {
    type: CONST_CREATE_TEST_TOGGLE_CLOSE_TIME
  }
}

/**
 * Function toggles whether or not open time is shown
 * @returns {{type: string}}
 */
export function actionCreateTestToggleOpenTime(){
  return {
    type: CONST_CREATE_TEST_TOGGLE_OPEN_TIME
  }
}

/**
 * Function toggles whether or not there is an attempt limit
 * @returns {{type: string}}
 */
export function actionCreateTestToggleAttemptLimit(){
  return {
    type: CONST_CREATE_TEST_TOGGLE_ATTEMPT_LIMIT
  }
}

/**
 * Function toggles whether or not there is a time limit in minutes
 * @returns {{type: string}}
 */
export function actionCreateTestToggleTimeLimit(){
  return {
    type: CONST_CREATE_TEST_TOGGLE_TIME_LIMIT
  }
}

/**
 * This Submits the test
 * If there is no attempts then attempts should be -1
 If there is no time limit then time limit should be -1
 If there is no close time then close time should be set to 200 years from today
 If there is no open time then open time should be set to 100 years from today
 * @param onCreate [func] a function that's passed in
 * @param props
 */
export function actionCreateTestSubmitTest (onCreate, props) {
  let s = props;

  // If there is no attempts then attempts should be -1
  let attempts = s.attempts;
  if (!props.hasAttemptsLimit) attempts = -1;
  // If there is no time limit then time limit should be -1
  let timeLimit = s.timeLimit;
  if (!props.hasTimeLimit)  timeLimit = -1;
  // If there is no close time then close time should be set to 200 years from today
  let deadlineDate = s.closeTime;
  if (!props.hasCloseTime) deadlineDate = daysFromToday(200);
  const deadline = convertDateToServerFormat(deadlineDate).replace (/[\-T:]/g, '');
  // If there is no open time then open time should be set to 100 years from today
  let openTimeDate = s.openTime;
  if (!props.hasOpentime) openTimeDate = daysFromToday(100);
  const openTime = convertDateToServerFormat(openTimeDate).replace (/[\-T:]/g, '');
  const questions = s.testQuestions.map (x => x.id);
  const seeds = s.testQuestions.map (x => x.locked ? x.seed : -1);


  Http.saveTest (
	  s.classId,
	  s.name,
	  deadline,
	  timeLimit.toString(),
	  attempts.toString(),
	  questions,
	  seeds,
	  openTime,
	  () => { props.onCreate()},
	  (e) => { alert (e.error)});
}



/**
 * helper function takes the date object created by inline date picker and converts it to format expected by server
 * @param date Input is the date object given by inline date pick component
 * @return [String] date format for the server
 */
function convertDateToServerFormat (date) {
  const d = new Date (date);
  let _date =
	  ("00" + (d.getMonth () + 1)).slice (-2) + "" +
	  ("00" + d.getDate ()).slice (-2) + "" +
	  ("00" + d.getHours ()).slice (-2) + "" +
	  ("00" + d.getMinutes ()).slice (-2) + "";
  _date = d.getFullYear () + "" + _date;
  return _date
}

/**
 * @param days [int]
 * @returns {Date} 100 years date object from today's date
 */
function daysFromToday(days) {
  var result = new Date();
  result.setDate(result.getDate() + days);
  return result;
}
