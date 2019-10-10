import {_request, cb} from './baseRequest';
import {AvoSet} from './types';

export interface GetSets {
    sets: AvoSet[];
}

export function getSets(success: cb<GetSets>, failure: cb) {
    _request('GET', '/getSets', success, failure);
}

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
