import {ajax} from 'rxjs/ajax'
import {of, pipe} from 'rxjs'
import {flatMap, first, map, catchError} from 'rxjs/operators'

const getBaseUrl = () => {
    if (process.env.NODE_ENV == 'PROD') {
        return 'https://app.avocadocore.com';
    } else if (process.env.NODE_ENV == 'DEV') {
        return 'https://dev.avocadocore.com';
    } else {
        return '';
    }
};
const BASE_URL = getBaseUrl();
export type RequestType = 'GET' | 'POST';

interface ErrorResponse {
    error: string;
}

export type cb<T = ErrorResponse> = (x: T) => void;

export function _request<S, T>(
    method: RequestType,
    url: string,
    success: cb<S>,
    failure: cb<ErrorResponse & T>,
    body: any = {},
) {
    url = `${BASE_URL}${url}`;
    return ajax({
        url,
        method,
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
        },
        body
    }).pipe(
        first(),
        flatMap(response => {
            const res = response.response;
            if (res.error) {
                console.warn(
                    `Error from ${url}:
                        ${res.error}`
                );
                throw res.error;
            }
            return of(res);
        }),
    ).subscribe(
        res => success(res),
        err => failure(err),
    )
}

export function _observable_request<S, T>(
    method: RequestType,
    url: string,
    body: any = {},
) {
    return ajax({
        url,
        method,
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
        },
        body
    }).pipe(
        first(),
        flatMap(response => {
            const res = response.response;
            if (res.error) {
                console.warn(
                    `Error from ${url}:
                        ${res.error}`
                );
                throw res.error;
            }
            return of(res);
        }),
    )
}
