/**
 * Turns {0} into the plaintext expression it represents, using a given string list
 * @param str The string to format
 * @param strings The string list to use to format it
 * @returns {string} The formatted string
 */
export function formatStringForEditing(str: string, strings: {expr: string}[]) {
    let result = '';
    let re = /{(\d+)}|{{|}}|\$\\\\\$/;
    // noinspection JSValidateTypes
    for (let m = re.exec(str); m !== null; m = re.exec(str)) {
        result += str.slice(0, m.index);
        str = str.slice(m.index + m[0].length);
        if (m[0] === '{{') {
            result += '{';
        } else if (m[0] === '}}') {
            result += '}';
        } else if (m[0] === '$\\\\$') {
            result += '\n';
        } else {
            result += '`' + strings[Number(m[1])].expr + '`';
        }
    }
    return (result + str).replace(/—/g, '\n@');
}
