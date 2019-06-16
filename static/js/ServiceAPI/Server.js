const fakeServer = true; // Set to false to communicate with actual server

const student1Test1 = {
  "firstName": "John",
  "lastName": "Doe",
	"email": "hli842@uwo.ca",
    "classes": {
        1: {
            "id": 1,
            "name": "1600 Example Class",
            "tests": [
                {
                    "deadline": "Sat, 31 Aug 2019 00:00:00 GMT",
                    "id": 1,
                    "name": "Set 1 Quiz",
                    "score": 100
                },
                {
                    "deadline": "Fri, 31 Aug 2018 00:00:00 GMT",
                    "id": 2,
                    "name": "Set 2 Quiz",
                    "score": 78.57
                },
                {
                    "deadline": "Fri, 31 Aug 2018 00:00:00 GMT",
                    "id": 3,
                    "name": "Set 3 Quiz",
                    "score": 73.33
                },
            ]
        },
        2: {
            "id": 2,
            "name": "Math1229 Class",
            "tests": [
                {
                    "deadline": "Sat, 31 Aug 2019 00:00:00 GMT",
                    "id": 1,
                    "name": "Set 1 Quiz",
                    "score": 100
                },
                {
                    "deadline": "Fri, 31 Aug 2018 00:00:00 GMT",
                    "id": 2,
                    "name": "Set 2 Quiz",
                    "score": 78.57
                },
                {
                    "deadline": "Fri, 31 Aug 2018 00:00:00 GMT",
                    "id": 3,
                    "name": "Set 3 Quiz",
                    "score": 73.33
                },
            ]
        }
    },
}

const studentMichealSuggestion = {
  	"firstName": "John",
  	"lastName": "Doe",
	  "email": "hli842@uwo.ca",
    "classes": {
        1: {
            "id": 1,
            "name": "1600 Example Class",
            "enrollKey": "fhakshdjash29",
            "tests": {
               1:{
                    "deadline": "Sat, 31 Aug 2019 00:00:00 GMT",
                    "id": 1,
                    "name": "Set 1 Quiz",
                    "score": 100,
                    "isOpen": true,
                    "timesAllowed": 3,
                },
               2: {
                    "deadline": "Fri, 31 Aug 2018 00:00:00 GMT",
                    "id": 2,
                    "name": "Set 2 Quiz",
                    "score": 78.57,
                    "isOpen": false,
                    "timesAllowed": 1,
                },
                3: {
                    "deadline": "Fri, 31 Aug 2018 00:00:00 GMT",
                    "id": 3,
                    "name": "Set 3 Quiz",
                    "score": 73.33,
                    "isOpen": false,
                    "timesAllowed": 1,
                },
            }
        },
        2: {
            "id": 2,
            "name": "Math1229 Class",
			      "enrollKey": "fhakshdjash29",
            "tests": {
               1:{
                    "deadline": "Sat, 31 Aug 2019 00:00:00 GMT",
                    "id": 1,
                    "name": "Set 1 Quiz",
                    "score": 100,
                    "isOpen": false,
                    "timesAllowed": 3,
                },
               2: {
                    "deadline": "Fri, 31 Aug 2018 00:00:00 GMT",
                    "id": 2,
                    "name": "Set 2 Quiz",
                    "score": 78.57,
                    "isOpen": false,
                    "timesAllowed": 1,
                },
                3: {
                    "deadline": "Fri, 31 Aug 2018 00:00:00 GMT",
                    "id": 3,
                    "name": "Set 3 Quiz",
                    "score": 73.33,
                    "isOpen": false,
                    "timesAllowed": 1,
                },
            }


        }
    },
}
const teacherInitialRouteExample = {
   id: 3,
  firstName: "Bob",
  lastName: "Smack",
  classes: {
    classId1: {
      className: "Linear Algebra 1600",
      tests:{
        test1ID: {
          studentId1: student1Test1,
        },
      }
    }
  }
};



const student1Test2 = {
  testName: "Assignment 2",
  bestAttempt: {
    date: "Fri, 31 Aug 2018 00:00:00 GMT",
    score: 51,
    post: [
      {
        prompt: "Consider the matrices \(F=\begin{bmatrix}1&-2\\-3&6\end{bmatrix}\) and \(G=\begin{bmatrix}1&-1&1\\0&1&0\\-2&2&-2\end{bmatrix}\). Which of these matrices are invertible?",
        explanation:  ["\(\begin{array}{l}\text{\(F\)}\\\color{red}✘\text{…{1}{2}/\frac{1}{2} for this part of the question.", "\(\begin{array}{l}\text{\(G\)}\\\color{red}✘\text{…{1}{2}/\frac{1}{2} for this part of the question."],
        prompts: ["\(F\)", "\(G\)"],
        questionScores: [0.5, 0.5],
        questionTotal: [1]

      },
      {
        prompt: "Consider the matrices \(F=\begin{bmatrix}1&-2\\-3&6\end{bmatrix}\) and \(G=\begin{bmatrix}1&-1&1\\0&1&0\\-2&2&-2\end{bmatrix}\). Which of these matrices are invertible?",
        explanation:  ["\(\begin{array}{l}\text{\(F\)}\\\color{red}✘\text{…{1}{2}/\frac{1}{2} for this part of the question.", "\(\begin{array}{l}\text{\(G\)}\\\color{red}✘\text{…{1}{2}/\frac{1}{2} for this part of the question."],
        prompts: ["\(F\)", "\(G\)"],
        questionScores: [0.5, 0.5],
        questionTotal: [1]

      }
    ]
  },
  studentNumber: 21830383820389,
  studentEmail: "hli843@uwo.ca",
  studentFirstName: "Frank",
  studentLastName: "Li"
};
const student1Class1 = {
      className: "Linear Algebra 1600",
      classId: 98,
        tests:{
          test1ID: student1Test1,
          test2ID: student1Test2,
        }
    };
const student1Class2 = {
      className: "Math1229",
      classId: 98,
        tests:{
          test1ID: student1Test1,
          test2ID: student1Test2,
        }
    };
const student1 = {
  firstName: "Frank",
  lastName: "Li",
  classes: {
    classId1: student1Class1,
    classId2: student1Class2,
  }
};


const student2Test1 = {
  testName: "Assignment 1",
  bestAttempt: {
    date: "Fri, 31 Aug 2018 00:00:00 GMT",
    score: 51,
    post: [
      {
        prompt: "Consider the matrices \(F=\begin{bmatrix}1&-2\\-3&6\end{bmatrix}\) and \(G=\begin{bmatrix}1&-1&1\\0&1&0\\-2&2&-2\end{bmatrix}\). Which of these matrices are invertible?",
        explanation:  ["\(\begin{array}{l}\text{\(F\)}\\\color{red}✘\text{…{1}{2}/\frac{1}{2} for this part of the question.", "\(\begin{array}{l}\text{\(G\)}\\\color{red}✘\text{…{1}{2}/\frac{1}{2} for this part of the question."],
        prompts: ["\(F\)", "\(G\)"],
        questionScores: [0.5, 0.5],
        questionTotal: [1]

      },
      {
        prompt: "Consider the matrices \(F=\begin{bmatrix}1&-2\\-3&6\end{bmatrix}\) and \(G=\begin{bmatrix}1&-1&1\\0&1&0\\-2&2&-2\end{bmatrix}\). Which of these matrices are invertible?",
        explanation:  ["\(\begin{array}{l}\text{\(F\)}\\\color{red}✘\text{…{1}{2}/\frac{1}{2} for this part of the question.", "\(\begin{array}{l}\text{\(G\)}\\\color{red}✘\text{…{1}{2}/\frac{1}{2} for this part of the question."],
        prompts: ["\(F\)", "\(G\)"],
        questionScores: [0.5, 0.5],
        questionTotal: [1]

      }
    ]
  },
  studentNumber: 213213213213239,
  studentEmail: "anotherperson@uwo.ca",
  studentFirstName: "Jessie",
  studentLastName: "James"
};
const student2Test2 = {
  testName: "Assignment 2",
  bestAttempt: {
    date: "Fri, 31 Aug 2018 00:00:00 GMT",
    score: 51,
    post: [
      {
        prompt: "Consider the matrices \(F=\begin{bmatrix}1&-2\\-3&6\end{bmatrix}\) and \(G=\begin{bmatrix}1&-1&1\\0&1&0\\-2&2&-2\end{bmatrix}\). Which of these matrices are invertible?",
        explanation:  ["\(\begin{array}{l}\text{\(F\)}\\\color{red}✘\text{…{1}{2}/\frac{1}{2} for this part of the question.", "\(\begin{array}{l}\text{\(G\)}\\\color{red}✘\text{…{1}{2}/\frac{1}{2} for this part of the question."],
        prompts: ["\(F\)", "\(G\)"],
        questionScores: [0.5, 0.5],
        questionTotal: [1]

      },
      {
        prompt: "Consider the matrices \(F=\begin{bmatrix}1&-2\\-3&6\end{bmatrix}\) and \(G=\begin{bmatrix}1&-1&1\\0&1&0\\-2&2&-2\end{bmatrix}\). Which of these matrices are invertible?",
        explanation:  ["\(\begin{array}{l}\text{\(F\)}\\\color{red}✘\text{…{1}{2}/\frac{1}{2} for this part of the question.", "\(\begin{array}{l}\text{\(G\)}\\\color{red}✘\text{…{1}{2}/\frac{1}{2} for this part of the question."],
        prompts: ["\(F\)", "\(G\)"],
        questionScores: [0.5, 0.5],
        questionTotal: [1]

      }
    ]
  },
  studentNumber: 213213213213239,
  studentEmail: "anotherperson@uwo.ca",
  studentFirstName: "Jessie",
  studentLastName: "James"
};
const student2Class1 = {
      className: "Linear Algebra 1600",
      classId: 98,
        tests:{
          test1ID: student2Test1,
          test2ID: student2Test2,
        }
    };
const student2Class2 = {
      className: "Math1229",
      classId: 98,
        tests:{
          test1ID: student2Test1,
          test2ID: student2Test2,
        }
    };
const student2 = {
  firstName: "Jessie",
  lastName: "James",
  classes: {
    classId1: student1Class1,
    classId2: student1Class2,
  }
};


const teacher1Class1 = {
      className: "Linear Algebra 1600",
      tests:{
        test1ID: {
          studentId1: student1Test1,
          studentId2: student2Test1,
        },
        test2ID: {
          studentId1: student1Test2,
          studentId2: student2Test2,
        },
      }
    };
const teacher1Class2 = {
      className: "Math1229",
      tests:{
        test1ID: {
          studentId1: student1Test1,
          studentId2: student2Test1,
        },
        test2ID: {
          studentId1: student1Test2,
          studentId2: student2Test2,
        },
      }
    };
const teacher1 = {
  id: 3,
  firstName: "Bob",
  lastName: "Smack",
  classes: {
    classId1: teacher1Class1,
    classId2: teacher1Class2
  }

};

export function getStudent(id){
      return new Promise((res, rej) => {
        setTimeout(() => res({student: studentMichealSuggestion}), 1000)
      })

}

export function getTeacher(id){
  if (fakeServer){
      return new Promise((res, rej) => {
        setTimeout(() => res({...teacherInitialRouteExample}), 1000)
      })
  }
  else {
    return null;
  }


}

export function getInitialData(){
    return Promise.all([
        getStudent(5),
        getTeacher(6)
    ]).then(([users, questions]) => ({
            users,
            questions,
        }))
}
