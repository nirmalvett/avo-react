import {_request, cb} from './baseRequest';
import {Course} from './types';

export function createCourse(name: string, isOpen: boolean, success: cb<{}>, failure: cb) {
    _request('POST', '/createCourse', success, failure, {name, isOpen});
}

interface GetCourses {
    courses: Course[];
}

export function getCourses(success: cb<GetCourses>, failure: cb) {
    _request('POST', '/getCourses', success, failure);
}

export function toggleOrganicContent(courseID: number, success: cb<{ toggle: boolean }>, failure: cb) {
    _request('POST', '/toggleOrganicContent', success, failure, { courseID });
} 