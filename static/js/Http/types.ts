export interface AvoSet {
    setID: number;
    name: string;
    canEdit: boolean;
    questions: AvoQuestion[];
}

export interface AvoQuestion {
    questionID: number;
    name: string;
    string: string;
    total: number;
    answers: number;
    category: number;
    concepts: number[];
}
