import {_request, cb} from './baseRequest';

export interface SaveTest {
    testID: number;
}

export function saveTest(
    classID: number,
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
        classID,
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

export function openTest(testID: number, success: cb<{}>, failure: cb) {
    _request('POST', '/openTest', success, failure, {testID});
}

export function closeTest(testID: number, success: cb<{}>, failure: cb) {
    _request('POST', '/closeTest', success, failure, {testID});
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

export function getTest(testID: number, success: cb<GetTest>, failure: cb) {
    _request('POST', '/getTest', success, failure, {testID});
}

export interface SaveAnswer {
    message: 'answer saved' | 'answer saved, but an error occurred while grading';
}

export function saveAnswer(
    takesID: number,
    question: number,
    answer: string[],
    success: cb<SaveAnswer>,
    failure: cb,
) {
    _request('POST', '/saveAnswer', success, failure, {takesID, question, answer});
}

export function submitTest(takesID: number, success: cb<{}>, failure: cb) {
    _request('POST', '/submitTest', success, failure, {takesID});
}

export interface PostTest {
    questions: PostTest_Question[];
}

export interface PostTest_Question {
    prompt: string;
    prompts: string[];
    answers: string[][];
    types: string[];
    scores: number[];
    totals: number[];
    explanation: string[];
}

export function postTest(takesID: number, success: cb<PostTest>, failure: cb) {
    _request('POST', '/postTest', success, failure, {takesID});
}

export interface TestStats {
    numberStudents: number;
    testMean: number;
    testMedian: number;
    testSTDEV: number;
    questions: {
        numberStudents?: 0;
        questionMean: number;
        questionMedian: number;
        questionSTDEV?: number;
        questionMark?: 0;
        topMarksPerStudent?: number[];
        totalMark?: number;
    }[];
    topMarkPerStudent: number[];
    totalMark: number | [];
}

export function testStats(testID: number, success: cb<TestStats>, failure: cb) {
    _request('POST', '/testStats', success, failure, {testID});
}

export function changeMark(
    takesID: number,
    markArray: number[][],
    success: cb<never>,
    failure: cb,
) {
    _request('POST', '/changeMark', success, failure, {takesID, markArray});
}
