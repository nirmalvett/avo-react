import { RECEIVE_STUDENT } from "../Actions/student"
export function student(state={}, action){
    switch (action.type){
        case RECEIVE_STUDENT:
            return {
                ...state,
                ...action.student,
            };
        default:
            return state;
    }
}
