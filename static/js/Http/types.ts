export interface AvoSet {
    id: number;
    name: string;
    can_edit: boolean;
    questions: AvoQuestion[];
}

export interface AvoQuestion {
    id: number;
    name: string;
    string: string;
    total: number;
    answers: number;
    tags: number[];
}
