import {_request, cb} from './baseRequest';
import {AvoSet} from './types';

export interface GetSets {
    sets: AvoSet[];
}

export function getSets(success: cb<GetSets>, failure: cb) {
    _request('GET', '/getSets', success, failure);
}

// getAllQuestions

export function newSet(name: string, success: cb<never>, failure: cb) {
    _request('POST', '/newSet', success, failure, {name});
}

export function renameSet(id: number, name: string, success: cb<never>, failure: cb) {
    _request('POST', '/renameSet', success, failure, {id, name});
}

export function deleteSet(id: number, success: cb<never>, failure: cb) {
    _request('POST', '/deleteSet', success, failure, {id});
}

export function newQuestion(
    set: number,
    name: string,
    string: string,
    answers: number,
    total: number,
    success: cb<never>,
    failure: cb,
) {
    _request('POST', '/newQuestion', success, failure, {
        set,
        name,
        string,
        answers,
        total,
    });
}

export function renameQuestion(id: number, name: string, success: cb<never>, failure: cb) {
    _request('POST', '/renameQuestion', success, failure, {id, name});
}

export function editQuestion(
    id: number,
    string: string,
    answers: number,
    total: number,
    success: cb<never>,
    failure: cb,
) {
    _request('POST', '/editQuestion', success, failure, {id, string, answers, total});
}

export function deleteQuestion(id: number, success: cb<never>, failure: cb) {
    _request('POST', '/deleteQuestion', success, failure, {id});
}

export function getQuestion(question: number, seed: number, success: cb<never>, failure: cb) {
    _request('POST', '/getQuestion', success, failure, {question, seed});
}

export interface SampleQuestion {
    prompt: string;
    prompts: string[];
    types: number[];
    explanation: string[];
    variables: {[variable: string]: string};
}

export function sampleQuestion(
    string: string,
    seed: number,
    answers: string[] | undefined,
    success: cb<SampleQuestion>,
    failure: cb,
) {
    _request('POST', '/sampleQuestion', success, failure, {string, seed, answers});
}
