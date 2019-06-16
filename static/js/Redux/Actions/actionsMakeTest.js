import Http from "../../HelperFunctions/Http";


export const CONST_CREATE_TEST_GET_QUESTIONS = "CONST_CREATE_TEST_GET_QUESTIONS";
export const CONST_DEFAULT_TEST_SETTING = "CONST_DEFAULT_TEST_SETTING";
export const CONST_CREATE_TEST_OPEN_QUESTION_SET = "CONST_CREATE_TEST_OPEN_QUESTION_SET";
export const CONST_CREATE_TEST_ADD_QUESTION = "CONST_CREATE_TEST_ADD_QUESTION";
export const CONST_CREATE_TEST_DELETE_QUESTION = "CONST_CREATE_TEST_DELETE_QUESTION";
export const CONST_CREATE_TEST_REFRESH_QUESTION = "CONST_CREATE_TEST_REFRESH_QUESTION";
export const CONST_CREATE_TEST_LOCK_SEED = "CONST_CREATE_TEST_LOCK_SEED";
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
 * @return {object} object [description]
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
