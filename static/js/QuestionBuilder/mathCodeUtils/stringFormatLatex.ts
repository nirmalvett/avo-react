/**
 * Turns {0}, {1}, etc into the LaTeX strings from a given string list.
 * Also turns the replacement text blue, and removes any other colors it may have been set to.
 * @param str The string to format
 * @param strings The string list to use to format it
 * @returns {string} The formatted string
 */
export function formatString(str: string, strings: {LaTeX: string}[]) {
    let result = '';
    const re = /{(\d+)}|{{|}}/;
    for (let m = re.exec(str); m !== null; m = re.exec(str)) {
        result += str.slice(0, m.index);
        str = str.slice(m.index + m[0].length);
        if (m[0] === '{{') {
            result += '{';
        } else if (m[0] === '}}') {
            result += '}';
        } else {
            const {LaTeX} = strings[Number(m[1])];
            const LaTeX_without_colors = LaTeX.replace(/\\color{.*?}/g, '');
            result += `\\color{#5599ff}{${LaTeX_without_colors}}`;
        }
    }
    return result + str;
}
