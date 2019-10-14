import {_request, cb} from './baseRequest';

export function createSection(courseID: number, name: string, success: cb<{}>, failure: cb) {
    _request('POST', '/createSection', success, failure, {courseID, name});
}

export interface Home {
    sections: {
        sectionID: number;
        name: string;
        messages: {
            sectionID: number;
            user: string;
            header: string;
            body: string;
            timestamp: number;
        }[];
        tests: {
            testID: number;
            name: string;
            deadline: number;
        }[];
    }[];
}

export function home(success: cb<Home>, failure: cb) {
    _request('POST', '/home', success, failure);
}

export interface GetSections {
    sections: GetSections_Section[];
}

export interface GetSections_Section {
    sectionID: number;
    enrollKey: string | null;
    name: string;
    tests: GetSections_Test[];
}

export interface GetSections_Test {
    testID: number;
    name: string;
    open: boolean;
    openTime: number;
    deadline: number;
    timer: number;
    attempts: number;
    total: number;
    submitted: GetSections_TestSubmitted[];
    current: null | {
        timeStarted: number;
        timeSubmitted: number;
    };
    sectionAverage: number;
    sectionMedian: number;
    sectionSize: number;
    standardDeviation: number;
}

export interface GetSections_TestSubmitted {
    takesID: number;
    timeSubmitted: number;
    grade: number;
}

export function getSections(success: cb<GetSections>, failure: cb) {
    _request('GET', '/getSections', success, failure);
}

export interface GetSectionTestResults {
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

export function getSectionTestResults(
    testID: number,
    success: cb<GetSectionTestResults>,
    failure: cb,
) {
    _request('POST', '/getSectionTestResults', success, failure, {testID});
}

export function CSVDownload(sectionID: number, success: cb<{}>, failure: cb) {
    _request('GET', `/CSV/SectionMarks/${sectionID}`, success, failure);
}

export interface GetSectionData {
    names: string[];
    totals: number[];
    data: {
        [studentID: string]: (number | null)[];
    };
}

export function getSectionData(sectionID: number, success: cb<GetSectionData>, failure: cb) {
    _request('POST', '/getSectionData', success, failure, {sectionID});
}
