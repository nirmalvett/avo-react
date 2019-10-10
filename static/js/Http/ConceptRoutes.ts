import {_request, cb} from './baseRequest';

interface AddConcept {
    conceptID: number;
}

export function addConcept(
    courseID: number,
    name: string,
    lesson: string,
    success: cb<AddConcept>,
    failure: cb,
) {
    _request('POST', '/addConcept', success, failure, {courseID, name, lesson});
}

export function editConcept(
    conceptID: number,
    name: string,
    lesson: string,
    success: cb<{}>,
    failure: cb,
) {
    _request('POST', '/editConcept', success, failure, {conceptID, name, lesson});
}

export function deleteConcept(conceptID: number, success: cb<{}>, failure: cb) {
    _request('POST', '/deleteConcept', success, failure, {conceptID});
}

export function setConceptRelation(
    parentID: number,
    childID: number,
    weight: number,
    success: cb<{}>,
    failure: cb,
) {
    _request('POST', '/setConceptRelation', success, failure, {parentID, childID, weight});
}

export function setConceptQuestion(
    conceptID: number,
    questionID: number,
    weight: number,
    success: cb<{}>,
    failure: cb,
) {
    _request('POST', '/setConceptQuestion', success, failure, {conceptID, questionID, weight});
}

export interface GetConcepts {
    concepts: {
        conceptID: number;
        name: string;
    }[];
}

export function getConcepts(courseID: number, success: cb<GetConcepts>, failure: cb) {
    _request('POST', '/getConcepts', success, failure, {courseID});
}

interface GetConceptGraph {
    concepts: {
        conceptID: number;
        name: string;
        lesson: string;
    }[];
    edges: {
        parent: number;
        child: number;
        weight: number;
    }[];
}

export function getConceptGraph(courseID: number, success: cb<GetConceptGraph>, failure: cb) {
    _request('POST', '/getConceptGraph', success, failure, {courseID});
}

export interface GetNextLessons {
    concepts: {
        conceptID: number;
        name: string;
        lesson: string;
        strength: number;
        prereqs: {name: string; conceptID: number}[];
    }[];
}
export interface GetNextQuestion {
    ID: number;
    prompt: string;
    prompts: string[];
    seed: number;
    types: string[];
} 


export function getNextLessons(courseID: number, success: cb<GetNextLessons>, failure: cb) {
    _request('POST', '/getNextLessons', success, failure, {courseID});
}
export function getNextQuestion(conceptID: number, success: cb<GetNextQuestion[]>, failure: cb) {
    _request('POST', '/getNextQuestion', success, failure, {conceptID});
}
