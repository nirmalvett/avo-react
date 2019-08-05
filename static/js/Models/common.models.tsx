export interface Class {
    enrollKey: string;
    id: number;
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
    id: number;
    name: string;
    open: number;
    standardDeviation: number;
    submitted: SubmittedTest[];
}

export interface SubmittedTest {
    grade: number;
    takes: number;
    timeSubmitted: number;
}
