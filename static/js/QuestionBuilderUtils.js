String.prototype.format = function(...args) {
    let str = this.toString();
    args = args.map(x => x.toString());
    let result = "";
    let re = /{(\d+)}|{{|}}/;
    // noinspection JSValidateTypes
    for(let m=re.exec(str); m !== null; m=re.exec(str)) {
        result += str.slice(0, m.index);
        str = str.slice(m.index + m[0].length);
        if (m[0] === "{{")
            result += "{";
        else if (m[0] === "}}")
            result += "}";
        else
            result += args[m[1]];
    }
    return result + str;
};

export const CONSTANTS = {
    "True": ["*T", "✔", "\\color{green}✔"],
    "False": ["*F", "✘", "\\color{red}✘"],
};
export const FUNCTIONS = {
    "boolean": ["AA", null, null, ""],
    "number": ["AB", null, null, "min, max, zeroes/mod=0"],
    "matrix": ["AC", null, null, "min, max, zeroes/mod=0, rows, cols=1"],
    "code_vector": ["AD", null, null, "check vector"],
    "matrix_rank": ["AE", null, null, "dimension, rank, seed=-1, row=-1, column=-1, negative=-1, transpose=-1"],
    "matrix_eigen": ["AF", null, null, "dimension, seed=-1, row=-1"],
    "matrix_rank_mod5": ["AH", null, null, "dimension, rank, seed=-1, row=-1, column=-1, transpose=-1"],
    "basis": ["AI", null, null, "size, seed=-1, row=-1, column=-1, negative=-1"],
    "sqrt": ["DA", null, "\\sqrt{&0}", "n"],
    "sin": ["DB", null, null, "n"],
    "cos": ["DC", null, null, "n"],
    "tan": ["DD", null, null, "n"],
    "arcsin": ["DE", null, null, "n"],
    "arccos": ["DF", null, null, "n"],
    "arctan": ["DG", null, null, "n"],
    "rot": ["DH", null, null, "n"],
    "ref": ["DI", null, null, "n"],
    "norm": ["ED", null, null, "v"],
    "angle": ["EE", null, null, "u, v"],
    "proj": ["EF", null, "\\text{proj}_{&0}\\left(&1\\right)", "u, v"],
    "get": ["FD", null, null, "m, row=0, col=0"],
    "set": ["FE", null, null, "m, row=0, col=0, n"],
    "adj": ["FF", null, null, "m"],
    "det": ["FG", null, null, "m"],
    "inverse": ["FH", null, null, "m"],
    "rref": ["FI", null, null, "m"],
    "row": ["FJ", null, null, "m"],
    "col": ["FK", null, null, "m"],
    "null": ["FL", null, null, "m"],
    "eigenspaces": ["FM", null, null, "m"],
    "diagonal": ["FN", null, null, "v"],
    "rank": ["FO", null, null, "m"],
    "char_poly": ["FP", null, null, "m"],
    "orthogonalize": ["GF", null, null, "m"],
    "pmatrix": ["GH", null, "\\text{projectionmatrix}\\left(&0\\right)", "b"],
    "normalize": ["GI", null, null, "b"],
    "dim": ["GJ", null, null, "b"],
    "as_matrix": ["GK", null, null, "b"],
    "mc": ["HA", null, null, "student_answer, answer"],
    "tf": ["HB", null, null, "student_answer, answer"],
    "reset": ["HC", null, null, "object"],
    "equations": ["_B", null, null, "m, v=0"],
    "pivots": ["_C", null, null, "m"],
    "free_vars": ["_D", null, null, "m, b"],
    "point": ["_E", null, null, "v"],
    "augment": ["_F", null, null, "m, v"],
};
export const OPERATORS = {
    "or": [0, "BA", "or", "&0 \\text{ or } &1", 0, 0, 0, 0, 0, 0],
    "and": [1, "BB", "and", "&0 \\text{ and } &1", 1, 1, 1, 1, 1, 1],
    "not": [2, "BC", "not", "\\text{not } &0", 2, 2, null, 2, null, 2],
    "---": [7, "CA", "-", "- &0", 5, 5, null, 5, null, 5],
    "--": [5, "CA", "-", "- &0", 5, 5, null, 5, null, 5],
    "+": [4, "CB", "+", "&0 + &1", 4, 4, 4, 4, 4, 4],
    "-": [4, "CC", "-", "&0 - &1", 4, 4, 4, 5, 4, 5],
    "*": [5, "CD", "*", "&0 * &1", 5, 5, 5, 5, 5, 5],
    "/": [5, "CE", "/", "\\frac{ &0 }{ &1 }", 5, 6, 5, 6, 0, 0],
    "%": [5, "CF", "mod", "&0 \\text{ mod } &1", 5, 5, 5, 6, 5, 6],
    "^": [6, "CG", "^", "&0 ^{ &1 }", 6, 6, 8, 6, 8, 0],
    "=": [3, "CN", "=", "&0 = &1", 3, 3, 4, 4, 4, 4],
    "!=": [3, "CO", "≠", "&0 \\neq &1", 3, 3, 4, 4, 4, 4],
    ">=": [3, "CP", "≥", "&0 \\ge &1", 3, 3, 4, 4, 4, 4],
    "<=": [3, "CQ", "≤", "&0 \\le &1", 3, 3, 4, 4, 4, 4],
    ">": [3, "CR", ">", "&0 > &1", 3, 3, 4, 4, 4, 4],
    "<": [3, "CS", "<", "&0 < &1", 3, 3, 4, 4, 4, 4],
    "is_vector": [3, "EA", "is vector", "&0 \\text{ is vector}", 3, 3, 4, null, 4, null],
    "dot": [5, "EB", "•", "&0 \\cdot &1", 5, 5, 6, 6, 6, 6],
    "cross": [5, "EC", "⨯", "&0 \\times &1", 5, 5, 6, 6, 6, 6],
    "scalar_of": [3, "FA", "* c =", "c* &0 = &1", 3, 3, 5, 4, 5, 4],
    "~": [3, "FB", "~", "&0 \\sim &1", 3, 3, 4, 4, 4, 4],
    "^T": [6, "FC", "^T", "&0 ^\\text{T}", 6, 6, 8, null, 8, null],
    "contains": [3, "GA", "contains", "&0 \\text{ contains } &1", 3, 3, 4, 4, 4, 4],
    "in_span": [3, "GB", "in span", "&0 \\text{ in span } &1", 3, 3, 4, 0, 4, 0],
    "is_normal": [3, "GC", "is normal", "&0 \\text{ is normal}", 3, 3, 4, null, 4, null],
    "is_orthogonal": [3, "GD", "is orthogonal", "&0 \\text{ is orthogonal}", 3, 3, 4, null, 4, null],
    "exactly_equal": [3, "GE", "identical to", "&0 \\text{ identical to } &1", 3, 3, 4, 4, 4, 4],
};
for(let f in FUNCTIONS) {
    if (FUNCTIONS.hasOwnProperty(f)) {
        let arg_count = FUNCTIONS[f][3] === '' ? 0 : FUNCTIONS[f][3].split(',').length;
        let arg_string = Array(arg_count).fill().map((_, i) => "&" + i).join(", ");
        if (FUNCTIONS[f][1] === null) FUNCTIONS[f][1] = f + '(' + arg_string + ')';
        if (FUNCTIONS[f][2] === null) FUNCTIONS[f][2] = '\\text{' + f + '}\\left(' + arg_string + '\\right)';
    }
}
let formatRegex = array => array.map(x => x.replace(/[\[\]\-\\.+*?^$(){}=!<>|:]/g, "\\$&"));
const unary_regex = "[$@]\\d+|\\d+(?:\\.\\d+)?|[\\)\\]\\}]|" + formatRegex(Object.keys(CONSTANTS)
    .concat(Object.keys(OPERATORS).filter(x => OPERATORS[x][7] === null))).join("|");
// noinspection JSCheckFunctionSignatures
const REPLACE = formatRegex(Object.keys(OPERATORS).filter(x => x.includes("_")));
export const function_regex = "(" + Object.keys(FUNCTIONS).join("|") + ")\\(";
let part1 = "";  // Contains all remaining multi-character tokens
let part2 = "|[\\(\\{\\[,;?:";  // Contains all remaining single-character tokens
for (let o in OPERATORS) {
    if (OPERATORS.hasOwnProperty(o) && OPERATORS[o][7] !== null) {
        let x = o.replace(/[\[\]\-\\.+*?^$(){}=!<>|:]/g, "\\$&");
        if (o.length > 1)
            part1 += "|" + x;
        else
            part2 += x;
    }
}
const REGEX = unary_regex + "|" + function_regex + part1 + part2 + "]";

export function buildPlainText(mathCode) {
    let stack = [];
    let constants = {};
    for (let c in CONSTANTS)
        if (CONSTANTS.hasOwnProperty(c))
            constants[CONSTANTS[c][0]] = c;
    let operators = {};
    for (let o in OPERATORS)
        if (OPERATORS.hasOwnProperty(o))
            operators[OPERATORS[o][1]] = [o, OPERATORS[o][0], OPERATORS[o][6], OPERATORS[o][7]];
    operators["CA"][0] = "-";
    let functions = {};
    for (let f in FUNCTIONS)
        if (FUNCTIONS.hasOwnProperty(f))
            functions[FUNCTIONS[f][0]] = [f, (FUNCTIONS[f][3] === "") ? 0 : FUNCTIONS[f][3].split(",").length];
    let tokens = mathCode.split(" ");
    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];
        if (/^\$\d+$/.test(token)) {
            stack.push(["$" + (token.slice(1) - 0 + 1), 8]);
        } else if (/^@\d+$/.test(token)) {
            stack.push(["@" + (token.slice(1) - 0 + 1), 8]);
        } else if (/^-?\d+(\.\d+)?$/.test(token)) {
            stack.push([token, 8]);
        } else if (token === "]") {
            let rows = stack.splice(-2, 1)[0][0];
            let cols = stack.splice(-1, 1)[0][0];
            let args = stack.splice(-rows * cols);
            let rowList = [];
            for(let r=0; r<rows; r++)
                rowList.push(args.slice(r * cols, (r + 1) * cols).map(x => x[0]).join(", "));
            stack.push(["[" + rowList.join("; ") + "]", 8]);
        } else if (token === "}") {
            let count = stack.splice(-1, 1)[0][0];
            let args = stack.splice(-count);
            stack.push(["{" + args.map(x => x[0]).join(", ") + "}", 8]);
        } else if (token === "BD") {
            let args = stack.splice(-3).map(x => x[1] >= 0 ? x[0] : "(" + x[0] + ")");
            stack.push([args[0] + " ? " + args[1] + " : " + args[2], -1]);
        } else if (constants[token] !== undefined) {
            stack.push([constants[token], 8]);
        } else if (operators[token] !== undefined) {
            let o = operators[token];
            let str = o[0];
            if (o[3] !== null) {
                let x = stack.pop();
                if (x[1] > o[3])
                    str += " " + x[0];
                else
                    str += " (" + x[0] + ")";
            }
            if (o[2] !== null) {
                let x = stack.pop();
                if (x[1] >= o[2])
                    str = x[0] + " " + str;
                else
                    str = "(" + x[0] + ") " + str;
            }
            stack.push([str, o[1]]);
        } else if (functions[token] !== undefined) {
            let f = functions[token];
            stack.push([f[0] + "(" + stack.splice(-f[1]).map(x => x[0]).join(", ") + ")", 8])
        }
    }
    return stack.map(x => x[0]);
}

export function buildMathCode(text) {
    if (text.length === 0)
        return "";
    for (let i = 0; i < REPLACE.length; i++)
        text = text.replace(new RegExp(REPLACE[i].replace(/_/g, " "), "g"), REPLACE[i]);
    text = text.replace(/ /g, "").replace(new RegExp(REGEX.toString(), "g"), " $& ");

    // Make '-' a negative sign when appropriate. --- and -- are used as a unary_regex minus, and - is used for subtraction.
    text = text.trim().replace(/ {2,}/g, " ");

    // let function_regex = new RegExp(function_regex, "g");
    // for (let m = function_regex.exec(text); m !== null; m = function_regex.exec(text))
    //     if (!this.hints.functions.includes(m[0].slice(0, -1)))
    //         this.hints.functions.push(m[0].slice(0, -1));

    let tokens = text.split(" ");

    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] === "-" && (i === 0 || !new RegExp("^(?:" + unary_regex + ")$").test(tokens[i - 1]))) {
            if (i + 1 === tokens.length)
                return "<span style=\"color: #FF6666\">Unary minus at end of expression</span>";
            else if (tokens[i + 1] === "^")
                tokens[i] = "---";
            else if (!/^(?:\d+(?:\.\d+)?)$/.test(tokens[i + 1]))
                tokens[i] = "--";
            else {
                tokens.splice(i, 1);
                tokens[i] = "-" + tokens[i];
            }
        }
    }

    let str = "";
    for (let i = 0; i < tokens.length; i++) {
        if (new RegExp("^(?:" + REGEX + ")$").test(tokens[i]) || /^-?\d+(?:\.\d+)?$/.test(tokens[i]))
            str += " " + tokens[i];
        else { // noinspection CheckTagEmptyBody
            str += " <span style=\"color: #FF6666\">" + tokens[i] + "</span>";
        }
    }
    if (str.includes("</span>"))
        return str.substr(1).replace(/_/g, " ").replace(/-+/g, "-");

    let brackets = 0;
    let operations = [];
    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];
        if (/^-?\d+(?:\.\d+)?$/.test(token))
            tokens[i] = [token, token, token, 8, 8];
        else if (/^\$\d+$/.test(token))
            tokens[i] = ["$" + (token.substr(1) - 1), token, "\\color{DarkOrange}{" + token + "}", 8, 8];
        else if (/^@\d+$/.test(token))
            tokens[i] = ["@" + (token.substr(1) - 1), token, "\\color{Green}{" + token + "}", 8, 8];
        else if (token in CONSTANTS)
            tokens[i] = CONSTANTS[token].concat([8, 8]);
        else if (token in OPERATORS) {
            tokens[i] = [token, brackets + 1000 * OPERATORS[token][0] - i];
            operations.push(tokens[i]);
        } else if (/[({\[]/.test(token)) {
            tokens[i] = [token, brackets + 8000 - i];
            operations.push(tokens[i]);
            brackets += 10000;
        } else if (token === '?') {
            tokens[i] = [token, brackets - 1000 + i];
            operations.push(tokens[i]);
        } else if (/[)}\]]/.test(token))
            brackets -= 10000;
        else if (token !== "," && token !== ";" && token !== ":")
            alert("Something went wrong when handling this token: '" + token + "'");
        if (brackets < 0)
            return "<span style=\"color: #FF6666\">Mismatched close bracket</span>";
    }
    if (brackets !== 0)
        return "<span style=\"color: #FF6666\">Mismatched open bracket</span>";

    operations.sort(function (a, b) {
        return b[1] - a[1];
    });

    for (let i = 0; i < operations.length; i++) {
        let o = operations[i][0];
        let pos = tokens.indexOf(operations[i]);
        if (o in OPERATORS) {
            let data = OPERATORS[o];
            let args = [];
            let tx_p = [];
            let result = data.slice(1, 6);
            if (data[6] !== null) {
                if (pos === 0 || !Array.isArray(tokens[pos - 1]) || tokens[pos - 1].length !== 5)
                    return "<span style=\"color: #FF6666\">Missing first operand</span>";
                let x = tokens[pos - 1];
                result[1] = (x[3] < data[6] ? "(" + x[1] + ")" : x[1]) + " " + result[1];
                args.push(tokens.splice(pos - 1, 1)[0]);
                tx_p.push(data[8]);
                pos--;
            }
            if (data[7] !== null) {
                if (pos === tokens.length - 1 || !Array.isArray(tokens[pos + 1]) || tokens[pos + 1].length !== 5)
                    return "<span style=\"color: #FF6666\">Missing second operand</span>";
                let x = tokens[pos + 1];
                result[1] = result[1] + " " + (x[3] < data[7] ? "(" + x[1] + ")" : x[1]);
                args.push(tokens.splice(pos + 1, 1)[0]);
                tx_p.push(data[9]);
            }
            result[0] = args.map(x => x[0]).join(" ") + " " + result[0];
            for (let i = 0; i < args.length; i++)
                result[2] = result[2].replace("&" + i, tx_p[i] > args[i][4] ? "\\left(" + args[i][2] + "\\right)" : args[i][2]);
            tokens[pos] = result;
        } else if (o.substr(o.length - 1) === "(" && o.slice(0, -1) in FUNCTIONS) {
            let data = FUNCTIONS[o.slice(0, -1)];
            let args = [];
            let signature = data[3].split(",").map(x => x.trim()).map(x => x.split("="));
            while (tokens[pos + 1] !== ")") {
                if (args.length === signature.length) {
                    return "<span style=\"color: #FF6666\">Too many arguments in function</span>";
                } else if (Array.isArray(tokens[pos + 1]) && tokens[pos + 1].length === 5) {
                    args.push(tokens.splice(pos + 1, 1)[0]);
                    if (tokens[pos + 1] === "," && tokens[pos + 2] !== ")")
                        tokens.splice(pos + 1, 1);
                    else if (tokens[pos + 1] !== ")")
                        return "<span style=\"color: #FF6666\">Can't parse arguments in function</span>";
                } else if (tokens[pos + 1] === ",") {
                    tokens.splice(pos + 1, 1);
                    let value = signature[args.length][1];
                    if (value === undefined)
                        return "<span style=\"color: #FF6666\">Non-default arguments cannot be left blank</span>";
                    args.push([value, value, value, 8, 8])
                } else
                    return "<span style=\"color: #FF6666\">Invalid argument in function</span>";
            }
            tokens.splice(pos + 1, 1);
            while (args.length < signature.length) {
                let value = signature[args.length][1];
                if (value === undefined)
                    return "<span style=\"color: #FF6666\">Non-default arguments cannot be left blank</span>";
                args.push([value, value, value, 8, 8])
            }
            tokens[pos] = [args.map(x => x[0]).join(" ") + " " + data[0], data[1], data[2], 8, 8];
            for (let i = 0; i < args.length; i++) {
                let v = "&" + i;
                tokens[pos][1] = tokens[pos][1].replace(v, args[i][1]);
                tokens[pos][2] = tokens[pos][2].replace(v, args[i][2]);
            }
        } else if (o === "(") {
            tokens.splice(pos, 1);
            if (tokens[pos + 1] !== ")")
                return "<span style=\"color: #FF6666\">Invalid bracket structure</span>";
            tokens.splice(pos + 1, 1);
        } else if (o === "{") {
            let args = [];
            while (tokens[pos + 1] !== "}") {
                if (Array.isArray(tokens[pos + 1]) && tokens[pos + 1].length === 5) {
                    args.push(tokens.splice(pos + 1, 1)[0]);
                    if (tokens[pos + 1] === "," && tokens[pos + 2] !== "}")
                        tokens.splice(pos + 1, 1);
                    else if (tokens[pos + 1] !== "}")
                        return "<span style=\"color: #FF6666\">Can't parse arguments in basis</span>";
                } else
                    return "<span style=\"color: #FF6666\">Invalid argument in basis</span>";
            }
            tokens.splice(pos + 1, 1);
            tokens[pos] = [args.map(x => x[0]).join(" ") + " " + args.length + " }",
                "{" + args.map(x => x[1]).join(", ") + "}",
                "\\left\\{" + args.map(x => x[2]).join(",") + "\\right\\}", 8, 8];
        } else if (o === "[") {
            let rows = 1;
            let cols = 0;
            for (let x = pos + 1; tokens[x] !== "]"; x++) {
                if (tokens[x] === ";")
                    rows += 1;
                else if (Array.isArray(tokens[x]) && tokens[x].length === 5)
                    cols += 1;
            }
            if (cols % rows !== 0)
                return "Row length must be consistent within a matrix";
            cols /= rows;
            let result = ["", "[", "\\begin{bmatrix}"];
            for (let r = 1; r <= rows; r++) {
                for (let c = 1; c <= cols; c++) {
                    let cell = tokens.splice(pos + 1, 1)[0];
                    result[0] += cell[0] + " ";
                    result[1] += cell[1];
                    result[2] += cell[2];
                    if (c < cols) {
                        if (tokens.splice(pos + 1, 1)[0] !== ",")
                            return "Can't parse matrix cells";
                        result[1] += ", ";
                        result[2] += " & ";
                    }
                }
                if (r < rows) {
                    if (tokens.splice(pos + 1, 1)[0] !== ";")
                        return "Can't parse matrix cells";
                    result[1] += "; ";
                    result[2] += "\\\\"
                }
            }
            if (tokens.splice(pos + 1, 1)[0] !== "]")
                return "Can't parse matrix cells";
            tokens[pos] = [result[0] + rows + " " + cols + " ]", result[1] + "]", result[2] + "\\end{bmatrix}", 8, 8];
        } else if (o === "?") {
            if (pos === 0)
                return "Expression can't start with ternary operator";
            let args = tokens.slice(pos - 1, pos + 4);
            if (!Array.isArray(args[0]) || !Array.isArray(args[2]) || args[3] !== ":" || !Array.isArray(args[4]))
                return "Invalid ternary operator structure";
            tokens[pos - 1] = [
                args[0][0] + " " + args[2][0] + " " + args[4][0] + " BD",
                args[0][1] + " ? " + args[2][1] + " : " + args[4][1],
                args[0][2] + " \\text{ ? } " + args[2][2] + " \\text{ : } " + args[4][2],
                -1, -1
            ];
            tokens.splice(pos, 4);
        }
         else {
            alert("Something went wrong when evaluating '" + o + "'");
            return;
        }
    }

    if (tokens.length > 1)
        return "<span style=\"color: #FF6666\">Expression does not resolve to single term</span>";

    tokens = tokens[0];
    // tokens[2] = "$" + tokens[2] + "$";
    return tokens;
}

export function varNotation(str, varNames) {
    let result = "";
    let re = /{(\d+)}|{{|}}/;
    for(let m=re.exec(str); m!==null; m=re.exec(str)) {
        result += str.slice(0, m.index);
        str = str.slice(m.index + m[0].length);
        if (m[0] === "{{")
            result += "{";
        else if (m[0] === "}}")
            result += "}";
        else if (varNames === undefined)
            result += "$" + (Number(m[1]) + 1);
        else
            result += '`' + varNames[Number(m[1])] + '`';
    }
    return result + str;
}

export function strNotation(str, strList) {
    while (/`.+?`/.test(str)) {
        let match = /`(.+?)`/.exec(str);
        let mathCode = buildMathCode(match[1])[0];
        if (!mathCode.includes('_'))
            mathCode += ' _A';
        if (strList.includes(mathCode))
            str = str.substr(0, match.index) + '《' + strList.indexOf(mathCode) + '》'
                + str.substr(match.index + match[0].length);
        else {
            str = str.substr(0, match.index) + '《' + strList.length + '》'
                + str.substr(match.index + match[0].length);
            strList.push(mathCode);
        }
    }
    str = str.replace(/[{}]/g, "$&$&").replace(/《/g, '{').replace(/》/g, '}');
    return str;
}
