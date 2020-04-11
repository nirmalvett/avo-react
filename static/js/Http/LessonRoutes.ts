import {_request, cb} from './baseRequest';

export function addLesson(courseID: number, conceptID: number, content: string, hasAssignment: boolean, dueDate: number, success: cb<{}>, failure: cb) {
    _request('POST', '/addLesson', success, failure, {});
}

export function editLesson(success: cb<{}>, failure: cb) {
    _request('POST', '/editLesson', success, failure, {});
}

export function deleteLesson(success: cb<{}>, failure: cb) {
    _request('POST', '/deleteLesson', success, failure, {});
}

export function getLessons(courseID: number, success: cb<{}>, failure: cb) {
    _request('POST', '/getLessons', success, failure, {});
}