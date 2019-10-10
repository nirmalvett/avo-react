import {_request, cb} from './baseRequest';

export interface GetMessages {
    messages: {
        messageID: number;
        header: string;
        body: string;
        timestamp: number;
    }[];
}

export function getMessages(sectionID: number, success: cb<GetMessages>, failure: cb) {
    _request('POST', '/getMessages', success, failure, {sectionID});
}

export function addMessage(
    sectionID: number,
    header: string,
    body: string,
    success: cb<{}>,
    failure: cb,
) {
    _request('POST', '/addMessage', success, failure, {sectionID, header, body});
}

export function editMessage(
    messageID: number,
    header: string,
    body: string,
    success: cb<{}>,
    failure: cb,
) {
    _request('POST', '/editMessage', success, failure, {messageID, header, body});
}

export function deleteMessage(messageID: number, success: cb<{}>, failure: cb) {
    _request('POST', '/deleteMessage', success, failure, {messageID});
}
