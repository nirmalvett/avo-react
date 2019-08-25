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

export interface TagMastery {
    mastery: {
        ID: number;
        name: string;
        mastery: number;
    }[];
}

// todo: rename to be same as route
export function getMasteryTags(tagNames: any[], success: cb<TagMastery>, failure: cb) {
    _request('POST', '/tagMastery', success, failure, {tagNames});
}

export interface GetLessons {
    lessons: {
        ID: number;
        Tag: string;
        mastery: number;
        string: string;
    }[];
}

export function getLessons(success: cb<GetLessons>, failure: cb) {
    _request('GET', '/getLessons', success, failure);
}

export interface GetLessonQuestionResult {
    explanation: string[];
    mastery: number;
}

export function getLessonQuestionResult(
    questionID: number,
    answers: string[],
    seed: number,
    success: cb<GetLessonQuestionResult>,
    failure: cb,
) {
    _request('POST', '/getLessonQuestionResult', success, failure, {questionID, answers, seed});
}

export interface GetLessonData {
    String: string;
    questions: {
        ID: number;
        prompt: string;
        prompts: string[];
        types: string[];
        seed: number;
    }[];
}

export function getLessonData(lessonID: number, success: cb<GetLessonData>, failure: cb) {
    _request('POST', '/getLessonData', success, failure, {lessonID});
}
