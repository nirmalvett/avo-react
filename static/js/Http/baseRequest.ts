export type RequestType = 'GET' | 'POST' | 'PUT';

interface ErrorResponse {
    error: string;
}

export type cb<T = ErrorResponse> = (x: T) => void;

export function _request<S, T>(
    type: RequestType,
    url: string,
    success: cb<S>,
    failure: cb<ErrorResponse & T>,
    data: any = '',
) {
    const http = new XMLHttpRequest();
    http.open(type, url, true);
    http.setRequestHeader('Content-type', 'application/json;charset=UTF-8');
    http.onreadystatechange = () => {
        if (http.readyState === 4 && http.status === 200) {
            try {
                if (JSON.parse(http.responseText).error) {
                    console.warn(
                        'Ajax Error for Route' +
                            url +
                            '\n Error Message: ' +
                            JSON.stringify(JSON.parse(http.responseText)),
                    );
                    failure(JSON.parse(http.responseText));
                } else {
                    console.debug('----------------------------------------');
                    console.debug('url: ', url);
                    console.debug('data sent to server: ', data);
                    console.debug(
                        'returned Object from server: ',
                        JSON.parse(http.responseText),
                    );
                    success(JSON.parse(http.responseText));
                }
            } catch (e) {
                console.warn(`Error on ${url}: ${e}`);
            }
        }
    };
    http.send(JSON.stringify(data));
}
