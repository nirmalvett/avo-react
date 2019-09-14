import {_request, cb} from './baseRequest';

export interface GetTags {
    tags: {
        tagID: number;
        parent: number;
        tagName: string;
        childOrder: number;
    }[];
}

export function getTags(class_id: number, success: cb<GetTags>, failure: cb) {
    _request('POST', '/getTags', success, failure, {class_id});
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

export function addTag(name: string, class_id: number, success: cb<AddTag>, failure: cb) {
    _request('POST', '/addTag', success, failure, {name, class_id});
}

export function deleteTag(tagID: number, success: cb<{}>, failure: cb) {
    _request('POST', '/deleteTag', success, failure, {tagID});
}

export function getLessonsToEdit(class_id: number, success: cb<{}>, failure: cb) {
    _request('POST', '/getLessonsToEdit', success, failure, {class_id});
}
export function editLesson(lesson_id:number, class_id: number, tag_id: number, question_list: string, lesson_string: string, success: cb<{}>, failure: cb) {
    _request('POST', '/editLesson', success, failure, {lesson_id, class_id, tag_id, question_list, lesson_string});
}
export function addLesson(class_id: number, tag_id: number, question_list: string, lesson_string: string, success: cb<{}>, failure: cb) {
    _request('POST', '/addLesson', success, failure, {class_id, tag_id, question_list, lesson_string});
}
export function deleteLesson(lesson_id:number, success: cb<{}>, failure: cb) {
    _request('POST', '/deleteLesson', success, failure, {lesson_id});
}
export function getQuestionsForLessons(tag_ids:Array<number>, success: cb<{}>, failure: cb) {
    _request('POST', '/getQuestionsForLessons', success, failure, {tag_ids});
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
export function getLearnLessons(success: cb<GetLessons>, failure: cb) {
    _request('GET', '/getLearnLessons', success, failure);
}
export interface GetLessonQuestionResult {
    explanation: string[];
    mastery: number;
}

export function getLessonQuestionResult(
    lessonID: number,
    questionID: number,
    answers: string[],
    seed: number,
    success: cb<GetLessonQuestionResult>,
    failure: cb,
) {
    _request('POST', '/getLessonQuestionResult', success, failure, {lessonID, questionID, answers, seed});
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

export function getTagTimeStamps(classID: number, success: cb, failure: cb) {
    _request('POST', '/getMastery', success, failure, {classID});
}

export function addTagQuestion(questionID: number, tagID: number, success: cb<{}>, failure: cb) {
    _request('POST', '/addTagQuestion', success, failure, {questionID, tagID});
}

export function removeTagQuestion(questionID: number, tagID: number, success: cb<{}>, failure: cb) {
    _request('POST', '/removeTagQuestion', success, failure, {questionID, tagID});
}
