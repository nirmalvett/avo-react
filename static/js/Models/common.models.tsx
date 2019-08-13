export interface Class {
    classID: number;
    enrollKey: string;
    name: string;
    tests: Test[];
}

export interface Test {
    testID: number;
    attempts: number;
    classAverage: number;
    classMedian: number;
    classSize: number;
    current?: any;
    deadline: number;
    name: string;
    open: boolean;
    standardDeviation: number;
    submitted: SubmittedTest[];
}

export interface SubmittedTest {
    takesID: number;
    grade: number;
    timeSubmitted: number;
}

export interface User {
    username: string;
    firstName: string;
    lastName: string;
    isTeacher: boolean;
    isAdmin: boolean;
    color: number;
    theme: 'dark' | 'light';
}
