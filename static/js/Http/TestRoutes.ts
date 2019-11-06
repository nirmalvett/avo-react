import {_request, cb} from './baseRequest';

export interface SaveTest {
    testID: number;
}

export function saveTest(
    sectionID: number,
    name: string,
    openTime: number,
    deadline: number,
    timer: number,
    attempts: number,
    questionList: number[],
    seedList: number[],
    success: cb<SaveTest>,
    failure: cb,
) {
    _request('POST', '/saveTest', success, failure, {
        sectionID,
        name,
        deadline,
        timer,
        attempts,
        questionList,
        seedList,
        openTime,
    });
}

export function changeTest(
    testID: number,
    timer: number,
    name: string,
    deadline: number,
    openTime: number,
    attempts: number,
    success: cb<{}>,
    failure: cb,
) {
    _request('POST', `/changeTest`, success, failure, {
        testID,
        timer,
        name,
        deadline,
        attempts,
        openTime,
    });
}

export function deleteTest(testID: number, success: cb<{}>, failure: cb) {
    _request('POST', '/deleteTest', success, failure, {testID});
}

export function openTest(testID: number, success: cb<{openTime: number}>, failure: cb) {
    _request('POST', '/openTest', success, failure, {testID});
}

export function closeTest(testID: number, success: cb<{deadline: number}>, failure: cb) {
    _request('POST', '/closeTest', success, failure, {testID});
}

export interface TestStats {
    questions: {
        mean: number;
        median: number;
        standardDeviation: number;
        total: number;
        marks: number[];
    }[];
    grades: number[];
}

export function testStats(testID: number, success: cb<TestStats>, failure: cb) {
    _request('POST', '/testStats', success, failure, {testID});
}
