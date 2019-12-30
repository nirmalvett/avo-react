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

export interface GetConceptGraph {
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
    lessons: {
        conceptID: number;
        name: string;
        lesson: string;
        preparation: number;
        mastery: number;
        prereqs: {name: string; conceptID: number}[];
        masterySurvey: number;
        aptitudeSurvey: number;
    }[];
}

export function getNextLessons(courseID: number, success: cb<GetNextLessons>, failure: cb) {
    _request('POST', '/getNextLessons', success, failure, {courseID});
}

export interface GetNextQuestion {
    ID: number;
    prompt: string;
    prompts: string[];
    seed: number;
    types: string[];
}

export function getNextQuestion(conceptID: number, success: cb<GetNextQuestion>, failure: cb) {
    _request('POST', '/getNextQuestion', success, failure, {conceptID});
}

// Frontend Gives: questionString, ID, type
//      - questionString: the question student asks
//      - ID: the ID of the question (a question AVO is asking to challenge the student)  or a concept
//      - type: 0 for an inquiry about a question, 1 for an inquiry about a concept
//      - stringifiedQuestionObject: '{prompt: ..., prompts: ...}' to store so that we can see the original question

interface InquirySubmissionData {
    questionString: string; 
    questionID: number;
    inquiryType: number;
    stringifiedQuestionObject: string;
};

export function submitInquiry(data: InquirySubmissionData, success: cb<{}>, failure: cb) {
    _request('POST', '/submitInquiry', success, failure, data);
};

interface InquiryObject {
    ID: number;
    editedInquiry: string;
    hasAnswered: boolean;
    inquiryAnswer: string;
    inquiryType: boolean;
    originalInquiry: string;
    stringifiedQuestion: string;
}

export function getInquiries(questionID:number, inquiryType:number, success: cb<InquiryObject[]>, failure: cb) {
    _request('POST', '/getInquiries', success, failure, {questionID, inquiryType});
};
