export const RECEIVE_STUDENT = "RECEIVE_STUDENT";

export function receiveStudent(student){
    return {
        type:RECEIVE_STUDENT,
        student
    }
}
