import { CONST_MAKE_TEST_SETS, CONST_DEFAULT_TEST_SETTING } from "../Actions/teacher";

export function makeTest(state={}, action){
    switch (action.type){
        case CONST_MAKE_TEST_SETS:
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
