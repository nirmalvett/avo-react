import {ReactElement} from 'react';
import {buildMathCode} from './buildMathCode';

export function validateString(str: string): ReactElement[] {
    const errors = [];
    let re = /`(.+?)`/;
    for (let m = re.exec(str); m !== null; m = re.exec(str)) {
        str = str.slice(m.index + m[0].length);
        let x = buildMathCode(m[1]);
        if (!x.success) {
            errors.push(x.error);
        }
    }
    return errors;
}
