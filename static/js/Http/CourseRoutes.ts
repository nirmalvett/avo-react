import {_request, cb} from './baseRequest';
import {Course} from './types';

export function createCourse(name: string, success: cb<{}>, failure: cb) {
    _request('POST', '/createCourse', success, failure, {name});
}

interface GetCourses {
    courses: Course[];
}

export function getCourses(success: cb<GetCourses>, failure: cb) {
    _request('POST', '/getCourses', success, failure);
}
