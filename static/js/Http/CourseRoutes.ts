import {_request, cb} from './baseRequest';

export function createCourse(name: string, success: cb<{}>, failure: cb) {
    _request('POST', '/createCourse', success, failure, {name});
}
