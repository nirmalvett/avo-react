import {_request, cb} from './baseRequest';
import {Course} from './types';

export function createCourse(name: string, description: string, isOpen: boolean, success: cb<{}>, failure: cb) {
    _request('POST', '/createCourse', success, failure, {name, description, isOpen});
}

interface GetCourses {
    courses: Course[];
}

export function getCourses(success: cb<GetCourses>, failure: cb) {
    _request('POST', '/getCourses', success, failure);
}

export interface OpenCourse {
    courseID: number;
    courseName: string;
    description?: string;
    sections?: OpenCourseSection[];
}

export interface OpenCourseSection {
    enrollKey: string;
    enrolled: boolean;
    name: string;
    sectionID: number;
}

export function getOpenCourses(success: cb<{courses: OpenCourse[]}>, failure: cb) {
    _request('GET', '/getOpenCourses', success, failure)
}

export function getOpenCourse(courseID: Number, success: cb<{course: OpenCourse}>, failure: cb) {
    _request('POST', '/getOpenCourse', success, failure, {courseID})
}

export function enrollOpenCourse(sectionID: number, success: cb, failure: cb) {
    _request('POST', '/enrollOpenCourse', success, failure, {sectionID})
}

export function toggleOrganicContent(courseID: number, success: cb<{ toggle: boolean }>, failure: cb) {
    _request('POST', '/toggleOrganicContent', success, failure, { courseID });
} 
