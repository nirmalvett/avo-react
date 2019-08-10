export interface Class {
    enrollKey: string;
    classID: number;
    name: string;
    tests: Test[];
}

export interface Test {
    attempts: number;
    classAverage: number;
    classMedian: number;
    classSize: number;
    current?: any;
    deadline: number;
    testID: number;
    name: string;
    open: boolean;
    standardDeviation: number;
    submitted: SubmittedTest[];
}

export interface SubmittedTest {
    grade: number;
    takesID: number;
    timeSubmitted: number;
}
