import {_request, cb} from './baseRequest';

export function getTags(success: cb<never>, failure: cb) {
    _request('GET', '/getTags', success, failure);
}

export function putTags(tags: number[], success: cb<never>, failure: cb) {
    _request('PUT', '/putTags', success, failure, {tags});
}

export function addTag(tag: never, success: cb<never>, failure: cb) {
    _request('POST', '/addTag', success, failure, {tag});
}

export function deleteTag(tag: number, success: cb<never>, failure: cb) {
    _request('POST', '/deleteTag', success, failure, {tag});
}
