import {_request, cb} from './baseRequest';

interface Concept {
    conceptID: number;
    name: string;
    lesson: string;
};

interface Edge {
    child: number;
    parent: number;
    weight: number;
};

interface GetConceptGraph {
    concepts: Concept[];
    edges: Edge[];
};

export function getConceptGraph(class_id: number, success: cb<GetConceptGraph>, failure: cb) {
    _request('POST', '/getConceptGraph', success, failure, {class_id});
};

export function getConcepts(class_id: number, success: cb, failure: cb) {
    _request('POST', '/getConcepts', success, failure, {class_id});
};

export function addConceptRelation(relation: Edge, success: cb, failure: cb) {
    _request('POST', '/addConceptRelation', success, failure, {...relation});
};

export function editConceptRelation(relationID: number, weight: number, success: cb, failure: cb) {
    _request('POST', '/editConceptRelation', success, failure, {relationID : relationID , weight : weight});
};

export function deleteConceptRelation(relationID: Edge, success: cb, failure: cb) {
    _request('POST', '/addConceptRelation', success, failure, {relationID});
};
