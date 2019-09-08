import {ShowSnackBar} from '../../Layout/Layout';
import {buildMathCode} from './buildMathCode';
import {buildPlainText} from './buildPlainText';

interface References {
    string: string;
    strings: {
        expr: string;
        LaTeX: string;
        mathCode: string;
    }[];
}

export function extractReferences(str: string, snackbar: ShowSnackBar = () => {}): References {
    let string = '';
    const strings = [];
    const re = /`(.+?)`|{|}|(\$\w+)/;
    let didTheDumbImplicitQuoteThing = false;
    for (let m = re.exec(str); m !== null; m = re.exec(str)) {
        string += str.slice(0, m.index);
        str = str.slice(m.index + m[0].length);
        if (m[0] === '{') {
            string += '{{';
        } else if (m[0] === '}') {
            string += '}}';
        } else {
            string += '{' + strings.length + '}';
            didTheDumbImplicitQuoteThing = didTheDumbImplicitQuoteThing || m[1] === undefined;
            let {LaTeX, mathCode} = buildMathCode(m[1] ? m[1] : m[2]) as {
                LaTeX: string;
                mathCode: string;
            };
            const expr = buildPlainText(mathCode)[0];
            strings.push({expr, LaTeX, mathCode});
        }
    }
    if (didTheDumbImplicitQuoteThing) {
        snackbar('info', 'Missing quotes implicitly added', 4000);
    }
    string = (string + str).replace(/\n@/g, '—').replace(/\n/g, '$\\\\$');
    return {string, strings};
}
