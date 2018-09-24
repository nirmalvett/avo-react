export default class Http {
    static _request(type, url, success, failure, data = '') {
        console.log(url);
        const http = new XMLHttpRequest();
        http.open(type, url, true);
        http.setRequestHeader('Content-type', 'application/json;charset=UTF-8');
        http.onreadystatechange = () => {
            if (http.readyState === 4 && http.status === 200) {
                if (JSON.parse(http.responseText).error) {
                    console.warn('Ajax Error for Route' + url
                        + '\n Error Message: ' + JSON.stringify(JSON.parse(http.responseText)));
                    failure(JSON.parse(http.responseText));
                } else {
                    success(JSON.parse(http.responseText));
                }
            }
        };
        http.send(JSON.stringify(data));
    }

    static register(first_name, last_name, email, password, success, failure) {
        Http._request('POST', '/register', success, failure,
            {first_name: first_name, last_name: last_name, email: email, password: password});
    }

    static login(username, password, success, failure) {
        Http._request('POST', '/login', success, failure, {username: username, password: password});
    }

    static getUserInfo(success, failure) {
        Http._request('GET', '/getUserInfo', success, failure);
    }

    static logout(success, failure) {
        Http._request('GET', '/logout', success, failure);
    }

    static changeColor(color, success, failure) {
        Http._request('POST', '/changeColor', success, failure, {color: color});
    }

    static changeTheme(theme, success, failure) {
        Http._request('POST', '/changeTheme', success, failure, {theme: theme});
    }

    static createClass(name, success, failure) {
        Http._request('POST', '/createClass', success, failure, {name: name});
    }

    static getClasses(success, failure) {
        Http._request('GET', '/getClasses', success, failure);
    }

    static getSets(success, failure) {
        Http._request('GET', '/getSets', success, failure);
    }

    static enrollInClass(key, success, failure) {
        Http._request('POST', '/enroll', success, failure, {key: key});
    }

    static openTest(test, success, failure) {
        Http._request('POST', '/openTest', success, failure, {test: test});
    }

    static closeTest(test, success, failure) {
        Http._request('POST', '/closeTest', success, failure, {test: test});
    }

    static deleteTest(test, success, failure) {
        Http._request('POST', '/deleteTest', success, failure, {test: test});
    }

    static getQuestion(question, seed, success, failure) {
        Http._request('POST', '/getQuestion', success, failure, {question: question, seed: seed});
    }

    static getTest(test, success, failure) {
        Http._request('POST', '/getTest', success, failure, {test: test});
    }

    static saveTest(classID, name, deadline, timer, attempts, isAssignment, questionList, seedList, success, failure) {
        Http._request('POST', '/saveTest', success, failure, {classID: classID, name: name, deadline: deadline,
            timer: timer, attempts: attempts, questionList: questionList, seedList: seedList
        });
    }

    static saveAnswer(takes, question, answer, success, failure) {
        Http._request('POST', '/saveAnswer', success, failure, {takes: takes, question: question, answer: answer});
    }

    static submitTest(takes, success, failure) {
        Http._request('POST', '/submitTest', success, failure, {takes: takes});
    }

    static postTest(takes, success, failure) {
        Http._request('POST', '/postTest', success, failure, {takes: takes});
    }
}