import {
  CONST_CREATE_TEST_GET_QUESTIONS,
  CONST_DEFAULT_TEST_SETTING,
  CONST_CREATE_TEST_OPEN_QUESTION_SET,
  CONST_CREATE_TEST_ADD_QUESTION,
  CONST_CREATE_TEST_DELETE_QUESTION,
  CONST_CREATE_TEST_REFRESH_QUESTION,
  CONST_CREATE_TEST_LOCK_SEED,
  CONST_CREATE_TEST_NAME_FOR_TEST,
  CONST_CREATE_TEST_ATTEMPT_LIMIT,
  CONST_CREATE_TEST_AUTO_CLOSE,
  CONST_CREATE_TEST_TIME_LIMIT, CONST_CRETE_TEST_AUTO_OPEN
} from "../Actions/actionsMakeTest";
import {arrayWithout} from "../../HelperFunctions/Helpers";

const makeTestDefault = {
  sets: [],
  testQuestions: [],
  closeTime: new Date(),
  openTime: new Date(),
  name: null,
  timeLimit: null,
  attempts: null,
};

export function createTest(state = makeTestDefault, action) {
  switch (action.type) {
	case CONST_CREATE_TEST_GET_QUESTIONS:
	  return {
		...state,
		...action.returnObject,
	  };
	case CONST_DEFAULT_TEST_SETTING:
	  return {
		...state,
		...action.returnObject,
	  };
	case CONST_CREATE_TEST_OPEN_QUESTION_SET:
	  const {questionIndex} = action;
	  return Object.assign({}, state, {
	    ...state,
		sets: Object.assign({}, state.sets, {
		  ...state.sets,
		  [questionIndex]: Object.assign({}, state.sets[questionIndex], {
		    ...state.sets[questionIndex],
			open: !state.sets[questionIndex].open
		  })
		})
	  });
	case CONST_CREATE_TEST_ADD_QUESTION:
	  const { newQuestion } = action;
	  return Object.assign({}, state, {
	    ...state,
		testQuestions: [...state.testQuestions, newQuestion]
	  });
  	case CONST_CREATE_TEST_DELETE_QUESTION:
		const { index } = action;
		const testQuestionsWithout = arrayWithout(state.testQuestions, index);
		return {
			...state,
			testQuestions: [...testQuestionsWithout]
		};
	case CONST_CREATE_TEST_REFRESH_QUESTION:
	  /* action items: indexToReplace, newQuestion*/
	  state.testQuestions[action.indexToReplace] = action.newQuestion;
	  	return {
			...state,
			testQuestions: [
				...state.testQuestions
			]
		};
	case CONST_CREATE_TEST_LOCK_SEED:
	  state.testQuestions[action.index].locked = !state.testQuestions[action.index].locked;
	  	return {
			...state,
			testQuestions: [
				...state.testQuestions
			]
		};
	case CONST_CREATE_TEST_NAME_FOR_TEST:
	  return {
	    ...state,
		name: action.testName,
	  };
	case CONST_CREATE_TEST_ATTEMPT_LIMIT:
	  return {
	    ...state,
		attempts: action.attemptInt,
	  };
	case CONST_CREATE_TEST_AUTO_CLOSE:
	  return {
	    ...state,
		closeTime: action.date,
	  };
	case CONST_CREATE_TEST_TIME_LIMIT:
	  return {
	    ...state,
		timeLimit: action.minuteInt
	  };
	case CONST_CRETE_TEST_AUTO_OPEN:
	  return {
	    ...state,
		openTime: action.date
	  };
	default:
	  return state;
  }
}
