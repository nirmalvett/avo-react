import {
  CONST_CREATE_TEST_GET_QUESTIONS,
  CONST_DEFAULT_TEST_SETTING,
  CONST_CREATE_TEST_OPEN_QUESTION_SET,
  CONST_CREATE_TEST_ADD_QUESTION
} from "../Actions/actionsMakeTest";
import {copy} from "../../HelperFunctions/Utilities";

const makeTestDefault = {
  sets: [],
  testQuestions: [],
  deadline: '2018-01-01T00:00:00.000Z',
  _deadline: new Date(),
  openTime: '2018-01-01T00:00:00.000Z',
  _openTime: new Date(),
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
	default:
	  return state;
  }
}
