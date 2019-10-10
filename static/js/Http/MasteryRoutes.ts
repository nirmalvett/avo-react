import {_request, cb} from "./baseRequest";

export function postQuestionSurvey(conceptID: number, mastery: number, aptitude: number, success: cb<{}>, failure: cb) {
    _request('POST', '/postQuestionSurvey', success, failure, {conceptID, mastery, aptitude});
}
