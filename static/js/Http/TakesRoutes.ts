import {_request, cb} from './baseRequest';

export interface GetTest {
    takes: number;
    time_submitted: number;
    answers: string[][];
    questions: {
        prompt: string;
        prompts: string[];
        types: string[];
    }[];
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
    answers: string[];
    types: string[];
    scores: number[];
    totals: number[];
    explanation: string[];
    correctAnswer?: any;
    hideAnswersUntilDeadline: boolean;
    deadline: string;
}

export function postTest(takesID: number, success: cb<PostTest>, failure: cb) {
    _request('POST', '/postTest', success, failure, {takesID});
}

export function changeMark(
    takesID: number,
    markArray: number[][],
    success: cb<never>,
    failure: cb,
) {
    _request('POST', '/changeMark', success, failure, {takesID, markArray});
}
