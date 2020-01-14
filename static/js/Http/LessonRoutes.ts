import {_request, cb} from './baseRequest';

export function addLesson(success: cb<{}>, failure: cb) {
    _request('POST', '/addLesson', success, failure, {});
}

export function editLesson(success: cb<{}>, failure: cb) {
    _request('POST', '/editLesson', success, failure, {});
}

export function deleteLesson(success: cb<{}>, failure: cb) {
    _request('POST', '/deleteLesson', success, failure, {});
}