type RequestType = 'GET' | 'POST' | 'PUT';

type cb<T = {error: string}> = (x: T) => void;

interface ErrorResponse {
    error: string;
}

export interface UserResponse {
    first_name: string;
    last_name: string;
    is_teacher: boolean;
    is_admin: boolean;
    color: number;
    theme: boolean;
}

export default class Http {
    static _request<S, T>(
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

    static register(
        first_name: string,
        last_name: string,
        email: string,
        password: string,
        success: cb<never>,
        failure: cb,
    ) {
        Http._request('POST', '/register', success, failure, {
            first_name,
            last_name,
            email,
            password,
        });
    }

    static login(username: string, password: string, success: cb<never>, failure: cb) {
        Http._request('POST', '/login', success, failure, {username, password});
    }

    static getUserInfo(success: cb<UserResponse>, failure: cb) {
        Http._request('GET', '/getUserInfo', success, failure);
    }

    static logout(success: cb<never>, failure: cb) {
        Http._request('GET', '/logout', success, failure);
    }

    static changeColor(color: number, success: cb<never>, failure: cb) {
        Http._request('POST', '/changeColor', success, failure, {color});
    }

    static changeTheme(theme: number, success: cb<never>, failure: cb) {
        Http._request('POST', '/changeTheme', success, failure, {theme});
    }

    static createClass(name: string, success: cb<never>, failure: cb) {
        Http._request('POST', '/createClass', success, failure, {name});
    }
    static getMessages(classID: number, success: cb<never>, failure: cb) {
        Http._request('POST', '/getMessages', success, failure, {classID});
    }
    static addMessage(
        classID: number,
        title: string,
        body: string,
        success: cb<never>,
        failure: cb,
    ) {
        Http._request('POST', '/addMessage', success, failure, {classID, title, body});
    }
    static editMessage(
        messageID: number,
        title: string,
        body: string,
        success: cb<never>,
        failure: cb,
    ) {
        Http._request('POST', '/editMessage', success, failure, {messageID, title, body});
    }
    static deleteMessage(messageID: number, success: cb<never>, failure: cb) {
        Http._request('POST', '/deleteMessage', success, failure, {messageID});
    }
    static getClasses(success: cb<never>, failure: cb) {
        Http._request('GET', '/getClasses', success, failure);
    }

    static getTags(success: cb<never>, failure: cb) {
        Http._request('GET', '/getTags', success, failure);
    }
    static addTag(tag: never, success: cb<never>, failure: cb) {
        Http._request('POST', '/addTag', success, failure, {tag});
    }
    static deleteTag(tag: number, success: cb<never>, failure: cb) {
        Http._request('POST', '/deleteTag', success, failure, {tag});
    }
    static putTags(tags: number[], success: cb<never>, failure: cb) {
        Http._request('PUT', '/putTags', success, failure, {tags});
    }
    static getSets(success: cb<never>, failure: cb) {
        Http._request('GET', '/getSets', success, failure);
    }

    static enrollInClass(key: string, success: cb<never>, failure: cb) {
        Http._request('POST', '/enroll', success, failure, {key});
    }

    static openTest(test: number, success: cb<never>, failure: cb) {
        Http._request('POST', '/openTest', success, failure, {test});
    }

    static closeTest(test: number, success: cb<never>, failure: cb) {
        Http._request('POST', '/closeTest', success, failure, {test});
    }

    static deleteTest(test: number, success: cb<never>, failure: cb) {
        Http._request('POST', '/deleteTest', success, failure, {test});
    }

    static getQuestion(question: number, seed: number, success: cb<never>, failure: cb) {
        Http._request('POST', '/getQuestion', success, failure, {question, seed});
    }

    static getTest(test: number, success: cb<never>, failure: cb) {
        Http._request('POST', '/getTest', success, failure, {test});
    }

    static saveTest(
        classId: number,
        name: string,
        deadline: never,
        timer: number,
        attempts: number,
        questionList: number[],
        seedList: number[],
        openTime: never,
        success: cb<never>,
        failure: cb,
    ) {
        Http._request('POST', '/saveTest', success, failure, {
            classId,
            name,
            deadline,
            timer,
            attempts,
            questionList,
            seedList,
            openTime,
        });
    }

    static saveAnswer(
        takes: number,
        question: number,
        answer: never,
        success: cb<never>,
        failure: cb,
    ) {
        Http._request('POST', '/saveAnswer', success, failure, {takes, question, answer});
    }

    static submitTest(takes: number, success: cb<never>, failure: cb) {
        Http._request('POST', '/submitTest', success, failure, {takes});
    }

    static postTest(takes: number, success: cb<never>, failure: cb) {
        Http._request('POST', '/postTest', success, failure, {takes});
    }

    static getClassTestResults(test: number, success: cb<never>, failure: cb) {
        Http._request('POST', '/getClassTestResults', success, failure, {test});
    }

    static newSet(name: string, success: cb<never>, failure: cb) {
        Http._request('POST', '/newSet', success, failure, {name});
    }

    static renameSet(id: number, name: string, success: cb<never>, failure: cb) {
        Http._request('POST', '/renameSet', success, failure, {id, name});
    }

    static deleteSet(id: number, success: cb<never>, failure: cb) {
        Http._request('POST', '/deleteSet', success, failure, {id});
    }

    static newQuestion(
        set: number,
        name: string,
        string: string,
        answers: number,
        total: number,
        success: cb<never>,
        failure: cb,
    ) {
        Http._request('POST', '/newQuestion', success, failure, {
            set,
            name,
            string,
            answers,
            total,
        });
    }

    static renameQuestion(id: number, name: string, success: cb<never>, failure: cb) {
        Http._request('POST', '/renameQuestion', success, failure, {id, name});
    }

    static editQuestion(
        id: number,
        string: string,
        answers: number,
        total: number,
        success: cb<never>,
        failure: cb,
    ) {
        Http._request('POST', '/editQuestion', success, failure, {id, string, answers, total});
    }

    static deleteQuestion(id: number, success: cb<never>, failure: cb) {
        Http._request('POST', '/deleteQuestion', success, failure, {id});
    }

    static getTestStats(test: string, success: cb<never>, failure: cb) {
        Http._request('POST', '/testStats', success, failure, {id: test});
    }

    static sampleQuestion(
        string: string,
        seed: number,
        answers: never[],
        success: cb<never>,
        failure: cb,
    ) {
        Http._request('POST', '/sampleQuestion', success, failure, {string, seed, answers});
    }

    static CSVDownload(classid: number, success: cb<never>, failure: cb) {
        Http._request('GET', '/CSV/ClassMarks/' + classid, success, failure, {});
    }

    static getFreeTrial(classid: number, success: cb<never>, failure: cb) {
        Http._request('POST', '/freeTrial', success, failure, {classID: classid});
    }

    static changeMark(takesId: number, markArray: number[][], success: cb<never>, failure: cb) {
        Http._request('POST', '/changeMark', success, failure, {
            takeId: takesId,
            markArray: markArray,
        });
    }

    static resetPassword(email: string, success: cb<never>, failure: cb) {
        Http._request('POST', '/requestPasswordReset', success, failure, {email: email});
    }

    static submitPasswordChange(token: string, password: string, success: cb<never>, failure: cb) {
        Http._request('POST', `/passwordReset/${token}`, success, failure, {password: password});
    }

    static changeTest(
        test: number,
        timer: number,
        name: string,
        deadline: never,
        openTime: never,
        attempts: number,
        success: cb<never>,
        failure: cb,
    ) {
        Http._request('POST', `/changeTest`, success, failure, {
            test: test,
            timer: timer,
            name: name,
            deadline: deadline,
            attempts: attempts,
            openTime: openTime,
        });
    }
    static getHome(success: cb<never>, failure: cb) {
        Http._request('GET', '/home', success, failure);
    }
}
