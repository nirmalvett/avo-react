import { CONST_USER_LOGIN_DATA } from "../Actions/shared"
export function reducerAccount(state={}, action){
    switch (action.type){
        case CONST_USER_LOGIN_DATA:
            return {
                ...state,
                ...action.returnObject,
                theme: action.returnObject.theme ? 'dark' : 'light',
            };
        default:
            return state;
    }
}
