import {_request, cb} from './baseRequest';

export function register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    success: cb<{}>,
    failure: cb,
) {
    _request('POST', '/register', success, failure, {firstName, lastName, email, password});
}

export function login(username: string, password: string, success: cb<GetUserInfo>, failure: cb) {
    _request('POST', '/login', success, failure, {username, password});
}

export interface GetUserInfo {
    firstName: string;
    lastName: string;
    isTeacher: boolean;
    isAdmin: boolean;
    color: number;
    theme: boolean;
}

export function getUserInfo(success: cb<GetUserInfo>, failure: cb) {
    _request('GET', '/getUserInfo', success, failure);
}

export function logout(success: cb<{}>, failure: cb) {
    _request('GET', '/logout', success, failure);
}

export function requestPasswordReset(email: string, success: cb<{}>, failure: cb) {
    _request('POST', '/requestPasswordReset', success, failure, {email});
}

export function resetPassword(token: string, password: string, success: cb<{}>, failure: cb) {
    _request('POST', '/resetPassword', success, failure, {token, password});
}

export function completeSetup(token: string, password: string, success: cb<{}>, failure: cb) {
    _request('POST', '/completeSetup', success, failure, {token, password});
}

export function changeColor(color: number, success: cb<{}>, failure: cb) {
    _request('POST', '/changeColor', success, failure, {color});
}

export function changeTheme(theme: number, success: cb<{}>, failure: cb) {
    _request('POST', '/changeTheme', success, failure, {theme});
}

export function sendFeedback(message: string, success: cb<{}>, failure: cb) {
    _request('POST', '/sendFeedback', success, failure, {message});
}
