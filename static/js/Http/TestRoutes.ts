import {_request, cb} from './baseRequest';

export function saveTest(
    classId: number,
    name: string,
    deadline: never,
    timer: number,
    attempts: number,
    questionList: number[],
    seedList: number[],
    openTime: never,
    success: cb<never>,
    failure: cb,
) {
    _request('POST', '/saveTest', success, failure, {
        classId,
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
    test: number,
    timer: number,
    name: string,
    deadline: never,
    openTime: never,
    attempts: number,
    success: cb<never>,
    failure: cb,
) {
    _request('POST', `/changeTest`, success, failure, {
        test: test,
        timer: timer,
        name: name,
        deadline: deadline,
        attempts: attempts,
        openTime: openTime,
    });
}

export function deleteTest(test: number, success: cb<never>, failure: cb) {
    _request('POST', '/deleteTest', success, failure, {test});
}

export function openTest(test: number, success: cb<never>, failure: cb) {
    _request('POST', '/openTest', success, failure, {test});
}

export function closeTest(test: number, success: cb<never>, failure: cb) {
    _request('POST', '/closeTest', success, failure, {test});
}

export interface GetTest {
    takes: number;
    time_submitted: number;
    answers: string[][];
    questions: {
        prompt: string;
        prompts: string[];
        types: number[];
    };
}

export function getTest(test: number, success: cb<GetTest>, failure: cb) {
    _request('POST', '/getTest', success, failure, {test});
}

export function saveAnswer(
    takes: number,
    question: number,
    answer: never,
    success: cb<never>,
    failure: cb,
) {
    _request('POST', '/saveAnswer', success, failure, {takes, question, answer});
}

export function submitTest(takes: number, success: cb<never>, failure: cb) {
    _request('POST', '/submitTest', success, failure, {takes});
}

export function postTest(takes: number, success: cb<never>, failure: cb) {
    _request('POST', '/postTest', success, failure, {takes});
}

export function getTestStats(test: string, success: cb<never>, failure: cb) {
    _request('POST', '/testStats', success, failure, {id: test});
}

export function changeMark(takeId: number, markArray: number[][], success: cb<never>, failure: cb) {
    _request('POST', '/changeMark', success, failure, {takeId, markArray});
}
