import {ajax} from 'rxjs/ajax'
import {of, pipe} from 'rxjs'
import {flatMap, first, map, catchError} from 'rxjs/operators'
// For when we have frontend and backend split
// const getBaseUrl = () => {
//     if (process.env.NODE_ENV == 'PROD') {
//         return 'https://app.avocadocore.com';
//     } else if (process.env.NODE_ENV == 'DEV') {
//         return 'https://dev.avocadocore.com';
//     } else {
//         return '';
//     }
// };
// const BASE_URL = getBaseUrl();
export const BASE_URL = '';
export type RequestType = 'GET' | 'POST';

interface ErrorResponse {
    error: string;
}

export type cb<T = ErrorResponse> = (x: T) => void;

export function _request<S, T>(
    method: RequestType,
    route: string,
    success: cb<S>,
    failure: cb<ErrorResponse & T>,
    body: any = {},
) {
    observable_request$(method, route, body).subscribe(
        res => success(res),
        err => failure(err),
    )
}

export function observable_request$<S, T>(
    method: RequestType,
    route: string,
    body: any = {},
) {
    const url = `${BASE_URL}${route}`;
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
