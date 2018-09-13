export default class AvoHttp {
	static _request(type, url, success, failure, data="") {
		console.log(url, data);
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

	static login(username, password, success, failure=()=>{}) {
		AvoHttp._request('POST', '/login', success, failure, {username: username, password: password});
	}

	static getClasses(success, failure=()=>{}) {
		AvoHttp._request('GET', '/get_classes', success, failure);
	}

	static getUserInfo(success, failure=()=>{}) {
		AvoHttp._request('GET', '/get_user_info', success, failure);
	}
}