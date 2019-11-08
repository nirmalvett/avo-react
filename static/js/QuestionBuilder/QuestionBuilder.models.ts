import {ReactElement} from 'react';
import * as Http from '../Http';

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
