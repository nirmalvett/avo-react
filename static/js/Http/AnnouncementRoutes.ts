import {_request, cb} from './baseRequest';

export interface GetAnnouncements {
    announcements: {
        announcementID: number;
        header: string;
        body: string;
        timestamp: number;
    }[];
}

export function getAnnouncements(sectionID: number, success: cb<GetAnnouncements>, failure: cb) {
    _request('POST', '/getAnnouncements', success, failure, {sectionID});
}

export function addAnnouncement(
    sectionID: number,
    header: string,
    body: string,
    success: cb<{}>,
    failure: cb,
) {
    _request('POST', '/addAnnouncement', success, failure, {sectionID, header, body});
}

export function editAnnouncement(
    announcementID: number,
    header: string,
    body: string,
    success: cb<{}>,
    failure: cb,
) {
    _request('POST', '/editAnnouncement', success, failure, {announcementID, header, body});
}

export function deleteAnnouncement(announcementID: number, success: cb<{}>, failure: cb) {
    _request('POST', '/deleteAnnouncement', success, failure, {announcementID});
}
