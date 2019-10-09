import {_request, cb} from './baseRequest';

export interface GetClassWhitelist {
    whitelist: string[];
}

export function getClassWhitelist(class_id: number, success: cb<GetClassWhitelist>, failure: cb) {
    _request('POST', '/getClassWhitelist', success, failure, {class_id});
}

export interface AddStudentsToWhitelist {
    results: boolean[];
}

export function addStudentsToWhitelist(
    classID: number,
    uwoUsers: string[],
    success: cb<AddStudentsToWhitelist>,
    failure: cb,
) {
    _request('POST', '/addToWhitelist', success, failure, {classID, uwoUsers});
}

export function createClass(name: string, success: cb<{}>, failure: cb) {
    _request('POST', '/createSection', success, failure, {name});
}

export interface Home {
    messages: {
        class: {
            id: number;
            name: string;
        };
        messages: {
            title: string;
            body: string;
            date: number;
        }[];
    }[];
    dueDates: {
        class: {
            id: number;
            name: string;
        };
        dueDates: {
            id: number;
            name: string;
            dueDate: number;
        }[];
    }[];
}

export function home(success: cb<Home>, failure: cb) {
    _request('POST', '/home', success, failure);
}

export interface GetClasses {
    classes: GetClasses_Class[];
}

export interface GetClasses_Class {
    classID: number;
    enrollKey: string;
    name: string;
    tests: GetClasses_Test[];
}

export interface GetClasses_Test {
    testID: number;
    name: string;
    open: boolean;
    openTime: number;
    deadline: number;
    timer: number;
    attempts: number;
    total: number;
    submitted: GetClasses_TestSubmitted[];
    current: null | {
        timeStarted: number;
        timeSubmitted: number;
    };
    classAverage: number;
    classMedian: number;
    classSize: number;
    standardDeviation: number;
}

export interface GetClasses_TestSubmitted {
    takesID: number;
    timeSubmitted: number;
    grade: number;
}

export function getClasses(success: cb<GetClasses>, failure: cb) {
    _request('GET', '/getSections', success, failure);
}

export interface GetClassTestResults {
    results: {
        userID: number;
        firstName: string;
        lastName: string;
        tests: {
            takesID: number;
            timeSubmitted: number;
            grade: number;
        }[];
    }[];
}

export function getClassTestResults(testID: number, success: cb<GetClassTestResults>, failure: cb) {
    _request('POST', '/getSectionTestResults', success, failure, {testID});
}

export function CSVDownload(classId: number, success: cb<{}>, failure: cb) {
    _request('GET', `/CSV/SectionMarks/${classId}`, success, failure);
}

export type Enroll =
    | {
          message: 'enrolled';
      }
    | {
          message: undefined;
          classID: number;
          price: number;
          discount: number;
          tax: number;
          totalPrice: number;
          freeTrial: boolean;
      };

export function enroll(key: string, success: cb<Enroll>, failure: cb) {
    _request('POST', '/enroll', success, failure, {key});
}

export function freeTrial(classID: number, success: cb<{}>, failure: cb) {
    _request('POST', '/freeTrial', success, failure, {classID});
}

export interface GetMessages {
    messages: {
        messageID: number;
        classID: number;
        title: string;
        body: string;
        dateCreated: number;
    }[];
}

export function getMessages(classID: number, success: cb<GetMessages>, failure: cb) {
    _request('POST', '/getMessages', success, failure, {classID});
}

export function addMessage(
    classID: number,
    title: string,
    body: string,
    success: cb<{}>,
    failure: cb,
) {
    _request('POST', '/addMessage', success, failure, {classID, title, body});
}

export function deleteMessage(messageID: number, success: cb<{}>, failure: cb) {
    _request('POST', '/deleteMessage', success, failure, {messageID});
}

export function editMessage(
    messageID: number,
    title: string,
    body: string,
    success: cb<{}>,
    failure: cb,
) {
    _request('POST', '/editMessage', success, failure, {messageID, title, body});
}

export interface GetClassData {
    names: string[];
    totals: number[];
    data: {
        [studentID: string]: (number | null)[];
    };
}

export function getClassData(classID: number, success: cb<GetClassData>, failure: cb) {
    _request('POST', '/getSectionData', success, failure, {classID});
}
