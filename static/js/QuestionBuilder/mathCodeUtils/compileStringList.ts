export function compileStringList(
    string: string,
    strings: {mathCode: string}[],
    outputStrings: string[],
): string {
    let result = '';
    let re = /{(\d+)}|{{|}}/;
    for (let m = re.exec(string); m !== null; m = re.exec(string)) {
        result += string.slice(0, m.index);
        string = string.slice(m.index + m[0].length);
        if (m[0] === '{{' || m[0] === '}}') {
            result += m[0];
        } else {
            let {mathCode} = strings[Number(m[1])];
            if (!mathCode.includes('_')) {
                mathCode += ' _A';
            }
            let index = outputStrings.indexOf(mathCode);
            if (index === -1) {
                index = outputStrings.length;
                outputStrings.push(mathCode);
            }
            result += '{' + index + '}';
        }
    }
    return result + string;
}
