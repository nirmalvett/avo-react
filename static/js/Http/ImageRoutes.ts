import {_request, cb} from './baseRequest';

export function getImages(success: cb<{images: any}>, failure: cb) {
    _request('GET', '/getImages', success, failure);
}
