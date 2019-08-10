import {_request, cb} from './baseRequest';

export interface GetTags {
    tags: {
        tagID: number;
        parent: number;
        tagName: string;
        childOrder: number;
    }[];
}

export function getTags(success: cb<GetTags>, failure: cb) {
    _request('GET', '/getTags', success, failure);
}

export type PutTagsArg = {
    tagID: number;
    parent: number | null;
    tagName: string;
    childOrder: number;
}[];

export function putTags(tags: PutTagsArg, success: cb<{}>, failure: cb) {
    _request('POST', '/putTags', success, failure, {tags});
}

export interface AddTag {
    tagID: number;
}

export function addTag(name: string, success: cb<AddTag>, failure: cb) {
    _request('POST', '/addTag', success, failure, {name});
}

export function deleteTag(tagID: number, success: cb<{}>, failure: cb) {
    _request('POST', '/deleteTag', success, failure, {tagID});
}
