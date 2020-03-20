export interface Course {
    courseID: number;
    name: string;
    canEdit: boolean;
    organicContentEnabled: boolean;
}

export interface SimpleQuestionConfig {
    type: string;
    types: string[];
    prompts: string[];
    explanation: string
    correct_answer: TrueFalseConfigCorrectAnswer | WordInputConfigCorrectAnswer;
}

export type TrueFalseConfigCorrectAnswer = "true" | "false";

export type WordInputConfigCorrectAnswer = number[];

export interface Question {
    config: SimpleQuestionConfig;
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
