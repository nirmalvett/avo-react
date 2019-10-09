export interface Class {
    sectionID: number;
    enrollKey: string | null;
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
    firstName: string;
    lastName: string;
    isTeacher: boolean;
    isAdmin: boolean;
    color: number;
    theme: 'dark' | 'light';
}
