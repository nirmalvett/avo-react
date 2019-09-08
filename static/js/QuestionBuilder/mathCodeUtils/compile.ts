import {compileStringList} from './compileStringList';
import {SEP1, SEP2, SEP3} from '../constants';
import {
    CompileSuccess,
    EditorCriteria,
    EditorMath,
    EditorPrompt,
    EditorSubPrompt,
} from '../QuestionBuilder.models';

interface CompileArgs {
    editorMath: EditorMath[];
    editorPrompt: EditorPrompt;
    editorPrompts: EditorSubPrompt[];
    editorCriteria: EditorCriteria[];
}

export function compile({editorMath, editorPrompt, editorPrompts, editorCriteria}: CompileArgs) {
    const editorMathFiltered = editorMath.filter(x => x.success) as (EditorMath & CompileSuccess)[];
    const PART0 = editorMathFiltered.map(x => x.mathCode);
    const PART1 = editorMathFiltered.map(x => x.varNames.join(SEP3));
    const PART2: string[] = [];
    const PART3 = [editorPrompt, ...editorPrompts].map(x =>
        compileStringList(x.prompt, x.strings, PART2),
    );
    const PART4 = editorPrompts.map(x => x.type);
    const PART5 = editorCriteria.map(x => x.points);
    const PART6 = editorCriteria.map(x => x.mathCode);
    const PART7 = editorCriteria.map(x => compileStringList(x.explanation, x.strings, PART2));
    const PART8 = editorMathFiltered.filter(x => x.success).map(x => x.comment);
    return [PART0, PART1, PART2, PART3, PART4, PART5, PART6, PART7, PART8]
        .map(x => x.join(SEP2))
        .join(SEP1);
}
