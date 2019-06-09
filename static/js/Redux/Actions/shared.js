import {getInitialData, getStudent, getTeacher } from "../../ServiceAPI/Server";
import { receiveStudent } from "./actionsStudent";
import Http from "../../HelperFunctions/Http";
export const CONST_USER_LOGIN_DATA = "CONST_USER_LOGIN_DATA";

export function handleLoginData(returnObject){
    return {
        type: CONST_USER_LOGIN_DATA,
        returnObject: returnObject
    }
}

