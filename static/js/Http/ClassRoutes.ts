import {_request, cb} from './baseRequest';

export function createClass(name: string, success: cb<{}>, failure: cb) {
    _request('POST', '/createClass', success, failure, {name});
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
        };
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
    classes: {
        classID: number;
        enrollKey: string;
        name: string;
        tests: {
            testID: number;
            name: string;
            open: boolean;
            openTime: number;
            deadline: number;
            timer: number;
            attempts: number;
            total: number;
            submitted: {
                takesID: number;
                timeSubmitted: number;
                grade: number;
            }[];
            current: null | {
                timeStarted: number;
                timeSubmitted: number;
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
    _request('POST', '/getClassTestResults', success, failure, {testID});
}

export function CSVDownload(classId: number, success: cb<{}>, failure: cb) {
    _request('GET', `/CSV/ClassMarks/${classId}`, success, failure);
}

export type Enroll =
    | {}
    | {
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
