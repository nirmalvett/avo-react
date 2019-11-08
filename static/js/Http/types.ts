export interface Course {
    courseID: number;
    name: string;
    canEdit: boolean;
}

export interface Question {
    questionID: number;
    name: string;
    string: string;
    total: number;
    answers: number;
    category: number;
    concepts: {[conceptID: number]: number};
}

export interface QuestionSet {
    setID: number;
    courseID: number;
    name: string;
    canEdit: boolean;
    questions: Question[];
}
