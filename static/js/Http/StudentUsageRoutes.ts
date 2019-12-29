import {_request, cb} from './baseRequest';

export function collectData(
    eventType: string,
    data: any,
    success: cb<{}>,
    failure: cb,
) {
    _request('POST', '/collectData', success, failure, {eventType, data});
}
