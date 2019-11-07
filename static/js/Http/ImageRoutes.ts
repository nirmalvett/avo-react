import {_request, cb} from './baseRequest';

export function searchImages(courseID: number, name: string, success: cb<{}>, failure: cb) {
    _request('POST', '/searchImages', success, failure, {courseID, name});
}
