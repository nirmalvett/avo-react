import { TrueFalseConfigCorrectAnswer } from "Http/types";

export interface PreviewTFQuestion {
    name: string;
    prompt: string;
    answer: string;
    explanation: string;
}

export interface SimplePreviewTFQuestion {
    name: string;
    prompt: string;
    answer: TrueFalseConfigCorrectAnswer;
    explanation: string;
}