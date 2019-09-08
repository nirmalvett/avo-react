import {SEP1, SEP2, SEP3} from '../constants';
import {buildPlainText} from './buildPlainText';
import {buildMathCode} from './buildMathCode';
import {
    CompileSuccess,
    EditorCriteria,
    EditorMath,
    EditorPrompt,
    EditorSubPrompt,
} from '../QuestionBuilder.models';

/*
There are 9 parts of the compiled string:
    0) Math
    1) Variable Names
    2) String expressions
    3) Prompts
    4) Types
    5) Points
    6) Criteria
    7) Explanations
    8) Comments
 */
export function init(string: string) {
    const sections = string.split(SEP1).map(x => x.split(SEP2));
    if (sections[0].length === 1 && sections[0][0] === '') {
        sections[0] = [];
    }
    if (sections[2].length === 1 && sections[2][0] === '') {
        sections[2] = [];
    }
    if (sections[6].length === 1 && sections[6][0] === '') {
        sections[6] = [];
    }
    const strings = sections[2]
        .filter(x => x.length > 0)
        .map(mathCode => {
            const expr = buildPlainText(mathCode)[0];
            const {LaTeX} = buildMathCode(expr) as {LaTeX: string};
            return {expr, mathCode, LaTeX};
        });
    const editorMath: EditorMath[] = sections[0].map((mc, i) => {
        const expr = buildPlainText(mc)[0];
        const {mathCode, plainText, LaTeX} = buildMathCode(expr) as CompileSuccess;
        return {
            success: true,
            varNames: sections[1][i].split(SEP3),
            expr,
            mathCode,
            plainText,
            LaTeX,
            comment: sections[8][i],
        };
    });
    const editorPrompt: EditorPrompt = {prompt: sections[3].splice(0, 1)[0], strings};
    const editorPrompts: EditorSubPrompt[] = sections[3].map((prompt, index) => ({
        type: sections[4][index],
        prompt,
        strings,
    }));
    const editorCriteria: EditorCriteria[] = sections[6].map((criteria, i) => {
        const expr = buildPlainText(criteria)[0];
        const {mathCode, LaTeX} = buildMathCode(expr) as CompileSuccess;
        return {
            points: sections[5][i],
            expr,
            mathCode,
            LaTeX,
            explanation: sections[7][i],
            strings: strings,
        };
    });
    return {editorMath, editorPrompt, editorPrompts, editorCriteria};
}
