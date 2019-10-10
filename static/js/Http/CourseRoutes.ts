import {_request, cb} from './baseRequest';

export function createCourse(name: string, success: cb<{}>, failure: cb) {
    _request('POST', '/createCourse', success, failure, {name});
}

interface GetCourses {
    courses: {
        courseID: number;
        name: string;
    }[];
}

export function getCourses(success: cb<GetCourses>, failure: cb) {
    _request('POST', '/getCourses', success, failure);
}
