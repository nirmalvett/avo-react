import {_request, cb} from './baseRequest';

export function addToWhitelist(
    sectionID: number,
    uwoUsers: string[],
    success: cb<{}>,
    failure: cb,
) {
    _request('POST', '/addToWhitelist', success, failure, {sectionID, uwoUsers});
}

export interface GetSectionWhitelist {
    whitelist: string[];
}

export function getSectionWhitelist(
    sectionID: number,
    success: cb<GetSectionWhitelist>,
    failure: cb,
) {
    _request('POST', '/getSectionWhitelist', success, failure, {sectionID});
}

export type Enroll =
    | {
          message: 'enrolled';
      }
    | {
          message: undefined;
          sectionID: number;
          price: number;
          discount: number;
          tax: number;
          totalPrice: number;
          freeTrial: boolean;
      };

export function enroll(key: string, success: cb<Enroll>, failure: cb) {
    _request('POST', '/enroll', success, failure, {key});
}

export function freeTrial(sectionID: number, success: cb<{}>, failure: cb) {
    _request('POST', '/freeTrial', success, failure, {sectionID});
}
