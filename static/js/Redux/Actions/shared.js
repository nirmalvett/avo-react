import {getInitialData, getStudent, getTeacher } from "../../ServiceAPI/Server";
import { receiveStudent } from "./student";
export const SET_ACCOUNT_TYPE = "SET_ACCOUNT_TYPE";
export const CONST_TEACHER_ACCOUNT = 'CONST_TEACHER_ACCOUNT';
export const CONST_STUDENT_ACCOUNT = 'CONST_STUDENT_ACCOUNT';
const AUTHED_ID = null; // should be set to null requiring login



export function setUserType(returnedInt){
    let accountType = CONST_STUDENT_ACCOUNT;
    if (returnedInt === 1){accountType = CONST_TEACHER_ACCOUNT}
    return {
        type: SET_ACCOUNT_TYPE,
        accountType: accountType,
    }
}

export function handleInitialData(){
    return (dispatch) => {
        return getStudent(5).then(({ student })=>{
            dispatch(receiveStudent(student))
        })
    }

}