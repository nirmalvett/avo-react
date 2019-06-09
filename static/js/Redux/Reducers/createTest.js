import { CONST_CREATE_TEST_GET_QUESTIONS, CONST_DEFAULT_TEST_SETTING } from "../Actions/teacher";

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

export function createTest(state=makeTestDefault, action){
    switch (action.type){
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
        default:
            return state;
    }
}
