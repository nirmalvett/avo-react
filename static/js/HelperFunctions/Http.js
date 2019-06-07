const debugMode = false; // if True it will print off everything

export default class Http {
	static _request(type, url, success, failure, data = '') {
		console.log(url);
		const http = new XMLHttpRequest();
		http.open(type, url, true);
		http.setRequestHeader('Content-type', 'application/json;charset=UTF-8');
		http.onreadystatechange = () => {
			if (http.readyState === 4 && http.status === 200) {
				try {
					if (JSON.parse(http.responseText).error) {
						console.warn('Ajax Error for Route' + url
								+ '\n Error Message: ' + JSON.stringify(JSON.parse(http.responseText)));
						failure(JSON.parse(http.responseText));
					} else {
						debugModeLog(type, url, data, http);
						success(JSON.parse(http.responseText));
					}
				} catch (e) {
					console.warn(`Error on ${url}: ${e}`);
				}
			}
		};
		http.send(JSON.stringify(data));
	}

	static register(first_name, last_name, email, password, success, failure) {
		Http._request('POST', '/register', success, failure, {first_name, last_name, email, password});
	}

	static login(username, password, success, failure) {
		Http._request('POST', '/login', success, failure, {username, password});
	}

	static getUserInfo(success, failure) {
		Http._request('GET', '/getUserInfo', success, failure);
	}

	static logout(success, failure) {
		Http._request('GET', '/logout', success, failure);
	}

	static changeColor(color, success, failure) {
		Http._request('POST', '/changeColor', success, failure, {color});
	}

	static changeTheme(theme, success, failure) {
		Http._request('POST', '/changeTheme', success, failure, {theme});
	}

	static createClass(name, success, failure) {
		Http._request('POST', '/createClass', success, failure, {name});
	}

	static getClasses(success, failure) {
		Http._request('GET', '/getClasses', success, failure);
	}

	static getSets(success, failure) {
		Http._request('GET', '/getSets', success, failure);
	}

	static enrollInClass(key, success, failure) {
		Http._request('POST', '/enroll', success, failure, {key});
	}

	static openTest(test, success, failure) {
		Http._request('POST', '/openTest', success, failure, {test});
	}

	static closeTest(test, success, failure) {
		Http._request('POST', '/closeTest', success, failure, {test});
	}

	static deleteTest(test, success, failure) {
		Http._request('POST', '/deleteTest', success, failure, {test});
	}

	static getQuestion(question, seed, success, failure) {
		Http._request('POST', '/getQuestion', success, failure, {question, seed});
	}

	static getTest(test, success, failure) {
		Http._request('POST', '/getTest', success, failure, {test});
	}

	static saveTest(classID, name, deadline, timer, attempts, questionList, seedList, success, failure) {
		Http._request('POST', '/saveTest', success, failure,
				{classID, name, deadline, timer, attempts, questionList, seedList});
	}

	static saveAnswer(takes, question, answer, success, failure) {
		Http._request('POST', '/saveAnswer', success, failure, {takes, question, answer});
	}

	static submitTest(takes, success, failure) {
		Http._request('POST', '/submitTest', success, failure, {takes});
	}

	static postTest(takes, success, failure) {
		Http._request('POST', '/postTest', success, failure, {takes});
	}

	static getClassTestResults(test, success, failure) {
		Http._request('POST', '/getClassTestResults', success, failure, {test});
	}

	static newSet(name, success, failure) {
		Http._request('POST', '/newSet', success, failure, {name});
	}

	static renameSet(id, name, success, failure) {
		Http._request('POST', '/renameSet', success, failure, {id, name});
	}

	static deleteSet(id, success, failure) {
		Http._request('POST', '/deleteSet', success, failure, {id});
	}

	static newQuestion(set, name, string, answers, total, success, failure) {
		Http._request('POST', '/newQuestion', success, failure, {set, name, string, answers, total});
	}

	static renameQuestion(id, name, success, failure) {
		Http._request('POST', '/renameQuestion', success, failure, {id, name});
	}

	static editQuestion(id, string, answers, total, success, failure) {
		Http._request('POST', '/editQuestion', success, failure, {id, string, answers, total});
	}

	static deleteQuestion(id, success, failure) {
		Http._request('POST', '/deleteQuestion', success, failure, {id});
	}

	static getTestStats(test, success, failure) {
		Http._request('POST', '/testStats', success, failure, {id: test});
	}

	static sampleQuestion(string, seed, answers, success, failure) {
		Http._request('POST', '/sampleQuestion', success, failure, {string, seed, answers});
	}

	static CSVDownload(classid, success, failure) {
		Http._request('GET', '/CSV/ClassMarks/' + classid, success, failure, {});
	}

	static getFreeTrial(classid, success, failure) {
		Http._request('POST', '/freeTrial', success, failure, {classID: classid});
	}

	static changeMark(takesId, markArray, success, failure) {
		Http._request('POST', '/changeMark', success, failure, {takeId: takesId, markArray: markArray});
	}

	static resetPassword(email, success, failure) {
		Http._request('POST', '/requestPasswordReset', success, failure, {email: email});
	}

	static submitPasswordChange(token, password, success, failure) {
		Http._request('POST', `/passwordReset/${token}`, success, failure, {password: password});
	};

	static changeTest(test, timer, name, deadline, attempts, success, failure) {
		Http._request('POST', `/changeTest`, success, failure,
				{test: test, timer:timer, name:name, deadline:deadline, attempts:attempts});
	};

	static synthesisScenarios(success, failure){
		/*Getting a list of possible scenarios to select from, just the list on the left
		* returns:
		* {
		   scenarios: [
		      { name: "2 matrix inverse" }
	      ]
      }
    */
		Http._request('POST', `/synthesisScenarios`, success, failure);
	};

	static synthesisPreviewScenario(scenarioName, success, failure){
		/* Getting a preview of a scenario selected, still in screen 1
		* excepts: scenarioName which is a String of the scenario
		*
		* returns:
		*   {
	        description: "A couple sentences describing what the objects are and their relationship",
	        graph:	json object to shove into the graph API
				}
		*/
		Http._request('POST', `/synthesisPreviewScenario`, success, failure,
				{scenarioName: scenarioName});
	};

	static synthesisGetTransversal(scenarioName, starting_matrix, ending_matrix, ending_state, success, failure){
		/* Getting the final graph (a single path) and latex explanation, Screen 2
		 * scenarioName: the String name of the scenario
		 * starting_matrix: i.e. 'matA', the string name of the starting state
		 * ending_matrix: i.e. 'matB', the string name of the end state
		 * ending_state: i.e. 'invertible', the string name of the destination object for which the endState Node in parameter above belongs
		 *
		 * returns:
		 *   {
			     graph: a list of the starting state and ending,
			     latexProof: latex string that shows the steps to proof everything
		     }
      */
		Http._request('POST', `/synthesisPreviewScenario`, success, failure,
				{
					scenarioName: scenarioName,
					starting_matrix: starting_matrix,
					ending_matrix: ending_matrix,
					ending_state: ending_state
				}
		);
	}


}

function debugModeLog(type, url, data = '', http) {
	if (debugMode) {
		console.log("----------------------------------------");
		console.log("url: ", url);
		console.log("data sent to server: ", data);
		console.log("returned Object from server: ", JSON.parse(http.responseText))
	}
}
