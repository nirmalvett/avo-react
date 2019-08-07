import {_request, cb} from './baseRequest';

export function register(
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    success: cb<never>,
    failure: cb,
) {
    _request('POST', '/register', success, failure, {first_name, last_name, email, password,});
}

export function login(username: string, password: string, success: cb<never>, failure: cb) {
    _request('POST', '/login', success, failure, {username, password});
}

export interface GetUserInfo {
    first_name: string;
    last_name: string;
    is_teacher: boolean;
    is_admin: boolean;
    color: number;
    theme: boolean;
}

export function getUserInfo(success: cb<GetUserInfo>, failure: cb) {
    _request('GET', '/getUserInfo', success, failure);
}

export function logout(success: cb<never>, failure: cb) {
    _request('GET', '/logout', success, failure);
}

export function requestPasswordReset(email: string, success: cb<never>, failure: cb) {
    _request('POST', '/requestPasswordReset', success, failure, {email});
}

export function passwordReset(token: string, password: string, success: cb<never>, failure: cb) {
    _request('POST', `/passwordReset/${token}`, success, failure, {password});
}

export function changeColor(color: number, success: cb<never>, failure: cb) {
    _request('POST', '/changeColor', success, failure, {color});
}

export function changeTheme(theme: number, success: cb<never>, failure: cb) {
    _request('POST', '/changeTheme', success, failure, {theme});
}
