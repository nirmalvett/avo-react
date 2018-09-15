export default class AvoHttp {
    static _request(type, url, success, failure, data = "") {
        console.log(url);
        const http = new XMLHttpRequest();
        http.open(type, url, true);
        http.setRequestHeader("Content-type", "application/json;charset=UTF-8");
        http.onreadystatechange = () => {
            if (http.readyState === 4 && http.status === 200) {
                if (JSON.parse(http.responseText).error) {
                    console.warn("Ajax Error for Route" + url
                        + "\n Error Message: " + JSON.stringify(JSON.parse(http.responseText)));
                    failure(JSON.parse(http.responseText));
                } else {
                    success(JSON.parse(http.responseText));
                }
            }
        };
        http.send(JSON.stringify(data));
    }

    static register(first_name, last_name, email, password, success, failure) {
        AvoHttp._request('POST', '/register', success, failure,
            {first_name: first_name, last_name: last_name, email: email, password: password});
    }

    static login(username, password, success, failure) {
        AvoHttp._request('POST', '/login', success, failure, {username: username, password: password});
    }

    static getUserInfo(success, failure) {
        AvoHttp._request('GET', '/getUserInfo', success, failure);
    }

    static logout(success, failure) {
        AvoHttp._request('GET', '/logout', success, failure);
    }

    static changeColor(color, success, failure) {
        AvoHttp._request('POST', '/changeColor', success, failure, {color: color});
    }

    static changeTheme(theme, success, failure) {
        AvoHttp._request('POST', '/changeTheme', success, failure, {theme: theme});
    }

    static createClass(name, success, failure) {
        AvoHttp._request('POST', '/createClass', success, failure, {name: name});
    }

    static getClasses(success, failure) {
        AvoHttp._request('GET', '/getClasses', success, failure);
    }

    static getSets(success, failure) {
        AvoHttp._request('GET', '/getSets', success, failure);
    }

    static enrollInClass(key, success, failure) {
        AvoHttp._request('POST', '/enroll', success, failure, {key: key});
    }

    static openTest(test, success, failure) {
        AvoHttp._request('POST', '/openTest', success, failure, {test: test});
    }

    static closeTest(test, success, failure) {
        AvoHttp._request('POST', '/closeTest', success, failure, {test: test});
    }

    static getQuestion(question, seed, success, failure) {
        AvoHttp._request('POST', '/getQuestion', success, failure, {question: question, seed: seed});
    }
}