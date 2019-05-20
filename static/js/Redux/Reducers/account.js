import { CONST_USER_LOGIN_DATA } from "../Actions/shared"
export function account(state={}, action){
    switch (action.type){
        case CONST_USER_LOGIN_DATA:
            return {
                ...state,
                ...action.returnObject
            };
        default:
            return state;
    }
}
