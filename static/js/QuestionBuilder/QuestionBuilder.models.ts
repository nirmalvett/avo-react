import {AvoSet} from '../Http/types';
import {ReactElement} from 'react';
import {ShowSnackBar} from '../Layout/Layout';
import * as Http from '../Http';

export interface QuestionBuilderProps {
    initManager: (s: number, q: number, sets: AvoSet[]) => void;
    updateProps: (s: number, q: number, sets: AvoSet[]) => void;
    showSnackBar: ShowSnackBar;
    s: number;
    q: number;
    sets: AvoSet[];
}

export interface CompileSuccess {
    success: true;
    mathCode: string;
    plainText: string;
    LaTeX: string;
}

export interface CompileFailure {
    success: false;
    error: ReactElement;
}

export type EditorMath = {
    varNames: string[];
    expr: string;
    comment: string;
} & (CompileSuccess | CompileFailure);

export interface EditorPrompt {
    prompt: string;
    strings: {
        expr: string;
        mathCode: string;
        LaTeX: string;
    }[];
}

export interface EditorSubPrompt {
    type: string;
    prompt: string;
    strings: {
        expr: string;
        mathCode: string;
        LaTeX: string;
    }[];
}

export interface EditorCriteria {
    points: string;
    expr: string;
    mathCode: string;
    LaTeX: string;
    explanation: string;
    strings: {
        expr: string;
        mathCode: string;
        LaTeX: string;
    }[];
}

export interface QuestionBuilderState {
    initError: boolean;
    mode: QuestionBuilderMode;
    editorMath: EditorMath[];
    editorPrompt: EditorPrompt;
    editorPrompts: EditorSubPrompt[];
    editorCriteria: EditorCriteria[];
    editorSeed: number;
    hints: HintsObj;
    tags: Http.GetTags['tags'];
}

export interface HintsObj {
    currentFunctions: [string, number][];
    selectedFunction: string;
    suggestedFunctions: string[];
    errors: never[];
}

export type QuestionBuilderMode =
    | {name: null}
    | {name: 'preview'; preview: Http.SampleQuestion}
    | {name: 'mainPrompt'; content: string}
    | {name: 'prompt'; index: number; content: {prompt: string; type: string}}
    | {name: 'math'; content: string}
    | {
          name: 'criteria';
          index: number;
          content: {explanation: string; criteria: string; points: string};
      };
