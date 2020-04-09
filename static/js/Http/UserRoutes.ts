import {_request, cb} from './baseRequest';

export function register(
    firstName: string,
    lastName: string,
    email: string,
    profileId: string,
    password: string,
    isTeacher: boolean,
    success: cb<{message: 'email sent' | 'password changed'}>,
    failure: cb,
) {
    _request('POST', '/register', success, failure, {
        firstName,
        lastName,
        email,
        profileId,
        password,
        isTeacher,
    });
}

export function login(
    username: string,
    password: string,
    success: cb<GetUserInfo>,
    failure: cb<string>,
) {
    _request('POST', '/login', success, failure, {username, password});
}

export interface GetUserInfo {
    firstName: string;
    lastName: string;
    isTeacher: boolean;
    isAdmin: boolean;
    color: number;
    theme: boolean;
    country: string;
    language: string;
    description: string;
    displayName: string;
    socials: string[];
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

export function availableProfileId(profileId: string, success: cb<{}>, failure: cb) {
    _request('POST', '/availableProfileId', success, failure, {profileId});
}

export function changeCountry(country: string, success: cb<{}>, failure: cb) {
    _request('POST', '/changeCountry', success, failure, {country});
}

export function changeLanguage(country: string, success: cb<{}>, failure: cb) {
    _request('POST', '/changeLanguage', success, failure, {country});
}

export function changeDescription(description: string, success: cb<{}>, failure: cb) {
    _request('POST', '/changeDescription', success, failure, {description});
}

export function changeDisplayName(displayName: string, success: cb<{}>, failure: cb) {
    _request('POST', '/changeDisplayName', success, failure, {displayName});
}

export function addSocialLink(link: string, success: cb<{}>, failure: cb) {
    _request('POST', '/addSocialLink', success, failure, {link});
}

export function deleteSocialLink(link: string, success: cb<{}>, failure: cb) {
    _request('POST', '/deleteSocialLink', success, failure, {link});
}
