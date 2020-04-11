import {_request, cb} from './baseRequest';

export function addLesson(courseID: number, content: string, hasAssignment: boolean, dueDate: number, success: cb<{}>, failure: cb) {
    _request('POST', '/addLesson', success, failure, {courseID, content, hasAssignment, dueDate});
}

export function editLesson(lessonID: number, content: string, hasAssignment: boolean, dueDate: number, success: cb<{}>, failure: cb) {
    _request('POST', '/editLesson', success, failure, {lessonID, content, hasAssignment, dueDate});
}

export function deleteLesson(lessonID: number, success: cb<{}>, failure: cb) {
    _request('POST', '/deleteLesson', success, failure, { lessonID });
}

export function getAssignments(lessonID: number, success: cb<{}>, failure: cb) {
    _request('POST', '/getAssignments', success, failure, {lessonID});
}

export function getLessons(courseID: number, success: cb<{}>, failure: cb) {
    _request('POST', '/getLessons', success, failure, {courseID});
}