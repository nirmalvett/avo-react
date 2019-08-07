import {_request, cb} from './baseRequest';

export function createClass(name: string, success: cb<never>, failure: cb) {
    _request('POST', '/createClass', success, failure, {name});
}

export function home(success: cb<never>, failure: cb) {
    _request('POST', '/home', success, failure);
}

export interface GetClasses {
    classes: {
        id: number;
        enrollKey: string;
        name: string;
        tests: {
            id: number;
            name: string;
            open: number;
            open_time: never;
            deadline: never;
            timer: number;
            attempts: number;
            total: number;
            submitted: {
                takes: number;
                timeSubmitted: never;
                grade: number;
            }[];
            current: null | {
                timeStarted: never;
                timeSubmitted: never;
            };
            classAverage: number;
            classMedian: number;
            classSize: number;
            standardDeviation: number;
        }[];
    }[];
}

export function getClasses(success: cb<GetClasses>, failure: cb) {
    _request('GET', '/getClasses', success, failure);
}

export function getClassTestResults(test: number, success: cb<never>, failure: cb) {
    _request('POST', '/getClassTestResults', success, failure, {test});
}

export function CSVDownload(classId: number, success: cb<never>, failure: cb) {
    _request('GET', `/CSV/ClassMarks/${classId}`, success, failure);
}

export function enroll(key: string, success: cb<never>, failure: cb) {
    _request('POST', '/enroll', success, failure, {key});
}

export function freeTrial(classID: number, success: cb<never>, failure: cb) {
    _request('POST', '/freeTrial', success, failure, {classID});
}

export interface GetMessages {
    messages: {
        MESSAGE: number;
        CLASS: number;
        title: string;
        body: string;
        date_created: never;
    }[];
}

export function getMessages(classID: number, success: cb<GetMessages>, failure: cb) {
    _request('POST', '/getMessages', success, failure, {classID});
}

export function addMessage(
    classID: number,
    title: string,
    body: string,
    success: cb<never>,
    failure: cb,
) {
    _request('POST', '/addMessage', success, failure, {classID, title, body});
}

export function deleteMessage(messageID: number, success: cb<never>, failure: cb) {
    _request('POST', '/deleteMessage', success, failure, {messageID});
}

export function editMessage(
    messageID: number,
    title: string,
    body: string,
    success: cb<never>,
    failure: cb,
) {
    _request('POST', '/editMessage', success, failure, {messageID, title, body});
}
