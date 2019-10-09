import {_request, cb} from './baseRequest';
import {AvoSet} from './types';

export interface GetSets {
    sets: AvoSet[];
}

export function getSets(success: cb<GetSets>, failure: cb) {
    _request('GET', '/getSets', success, failure);
}

// getAllQuestions

export interface NewSet {
    setID: number;
}

export function newSet(courseID: number, name: string, success: cb<NewSet>, failure: cb) {
    _request('POST', '/newSet', success, failure, {courseID, name});
}

export function renameSet(setID: number, name: string, success: cb<{}>, failure: cb) {
    _request('POST', '/renameSet', success, failure, {setID, name});
}

export function deleteSet(setID: number, success: cb<{}>, failure: cb) {
    _request('POST', '/deleteSet', success, failure, {setID});
}

export interface NewQuestion {
    questionID: number;
}

export function newQuestion(
    setID: number,
    name: string,
    string: string,
    answers: number,
    total: number,
    success: cb<NewQuestion>,
    failure: cb,
) {
    _request('POST', '/newQuestion', success, failure, {
        setID,
        name,
        string,
        answers,
        total,
    });
}

export function renameQuestion(questionID: number, name: string, success: cb<{}>, failure: cb) {
    _request('POST', '/renameQuestion', success, failure, {questionID, name});
}

export function editQuestion(
    questionID: number,
    string: string,
    answers: number,
    total: number,
    success: cb<{}>,
    failure: cb,
) {
    _request('POST', '/editQuestion', success, failure, {questionID, string, answers, total});
}

export function deleteQuestion(questionID: number, success: cb<{}>, failure: cb) {
    _request('POST', '/deleteQuestion', success, failure, {questionID});
}

export interface GetQuestion {
    prompt: string;
    prompts: string[];
    types: string[];
}

export function getQuestion(questionID: number, seed: number, success: cb<GetQuestion>, failure: cb) {
    _request('POST', '/getQuestion', success, failure, {questionID, seed});
}

export interface SampleQuestion {
    prompt: string;
    prompts: string[];
    types: string[];
    explanation: string[];
    variables: {[variable: string]: string};
}

export function sampleQuestion(
    string: string,
    seed: number,
    success: cb<SampleQuestion>,
    failure: cb,
) {
    _request('POST', '/sampleQuestion', success, failure, {string, seed});
}

export interface SampleQuestionAnswers {
    prompt: string;
    prompts: string[];
    types: number[];
    points: number[];
}

export function sampleQuestionAnswers(
    string: string,
    seed: number,
    answers: string[],
    success: cb<SampleQuestionAnswers>,
    failure: cb,
) {
    _request('POST', '/sampleQuestionAnswers', success, failure, {string, seed, answers});
}

export function changeCategory(questionID: number, category: number, success: cb<{}>, failure: cb) {
    _request('POST', '/changeCategory', success, failure, {questionID, category});
}
