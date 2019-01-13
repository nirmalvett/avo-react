from server.MathCode.AvoVariable import \
    MATRIX, BASIS, error, boolean, number, matrix, basis, mc_ans, tf_ans, vector_free_vars, polynomial, get_types
from math import sqrt, sin, cos, tan, asin, acos, atan, pi
from re import fullmatch, sub, search
from typing import List


def build_number(text: str):
    invalid = error('invalid expression')
    regex = r'\d+(?:\.\d+)?|(sqrt|sin|cos|tan|arcsin|arccos|arctan)\(|[()+\-*/^]'
    token_list: List = sub(r' {2,}', ' ', sub(regex, r' \g<0> ', text.replace(' ', '')).strip()).split(' ')
    if not all(map(lambda t: fullmatch(regex, t), token_list)):
        return invalid

    for i in range(len(token_list)):
        if token_list[i] == '-' and (i == 0 or not fullmatch(r'\d+(?:\.\d+)?|\)', token_list[i - 1])):
            if i + 1 == len(token_list):
                return invalid
            elif token_list[i - 1] == '^':
                token_list[i] = '---'
            else:
                token_list[i] = "--"

    brackets = 0
    operations = []
    operators = {"---": 8, "--": 6, "+": 4, "-": 4, "*": 5, "/": 5, "^": 7}
    for i in range(len(token_list)):
        token = token_list[i]
        if fullmatch(r'-?\d+(?:\.\d+)?', token):
            token_list[i] = float(token)
        elif token in operators:
            token_list[i] = [token, brackets + 1000 * operators[token] - i]
            operations.append(token_list[i])
        elif token.endswith('('):
            token_list[i] = [token, brackets + 8000 - i]
            operations.append(token_list[i])
            brackets += 10000
        elif token == ')':
            brackets -= 10000
        else:
            print("Something went wrong when handling this token: '" + token + "'")
            return invalid
        if brackets < 0:
            return invalid
    if brackets != 0:
        return invalid

    operations.sort(key=lambda item: item[1], reverse=True)

    for i in range(len(operations)):
        operation = operations[i][0]
        pos = token_list.index(operations[i])
        if operation in ('---', '--'):
            if pos == len(token_list) - 1 or not isinstance(token_list[pos + 1], float):
                return invalid
            token_list.pop(pos)
            token_list[pos] = -token_list[pos]
        elif operation in ('+', '-', '*', '/', '^'):
            if pos == 0 or pos == len(token_list) - 1 or not isinstance(token_list[pos - 1], float) \
                    or not isinstance(token_list[pos + 1], float):
                return invalid
            pos -= 1
            args = token_list.pop(pos), token_list.pop(pos + 1)
            if operation == '+':
                token_list[pos] = args[0] + args[1]
            elif operation == '-':
                token_list[pos] = args[0] - args[1]
            elif operation == '*':
                token_list[pos] = args[0] * args[1]
            elif operation == '/':
                if args[1] == 0:
                    return invalid
                token_list[pos] = args[0] / args[1]
            elif operation == '^':
                token_list[pos] = args[0] ** args[1]
            else:
                raise Exception("An unknown error occurred")
        elif operation in ('(', 'sqrt(', 'sin(', 'cos(', 'tan(', 'arcsin(', 'arccos(', 'arctan('):
            if pos > len(token_list) - 3 or not isinstance(token_list[pos + 1], float) or token_list[pos + 2] != ')':
                return invalid
            token_list.pop(pos + 2)
            arg = token_list.pop(pos + 1)
            if operation == '(':
                token_list[pos] = arg
            elif operation == 'sqrt(':
                token_list[pos] = sqrt(arg)
            elif operation == 'sin(':
                token_list[pos] = sin(arg * pi / 180)
            elif operation == 'cos(':
                token_list[pos] = cos(arg * pi / 180)
            elif operation == 'tan(':
                token_list[pos] = tan(arg * pi / 180)
            elif operation == 'arcsin(':
                token_list[pos] = asin(arg) * 180 / pi
            elif operation == 'arccos(':
                token_list[pos] = acos(arg) * 180 / pi
            elif operation == 'arctan(':
                token_list[pos] = atan(arg) * 180 / pi
            else:
                raise Exception("An unknown error occurred")
        else:
            print("Something went wrong when evaluating '" + operation + "'")
            return invalid

    if len(token_list) > 1:
        return invalid

    return number(token_list[0])


def build_vector_free_vars(cells: list):
    invalid = error('invalid expression')
    cells = list(map(lambda c: c.lower(), cells))
    equations = ''.join(cells)
    if '{' in equations or '}' in equations:
        return invalid
    var_list = ['#']
    # noinspection SpellCheckingInspection
    for letter in 'abcdefghijklmnopqrstuvwxyz':
        if search('(?<![a-z])' + letter + '(?![a-z])', equations):
            var_list.append(letter)
    var_count = len(var_list)

    lists = []
    for cell in cells:
        regex = r'\d+(?:\.\d+)?|(sqrt|sin|cos|tan|arcsin|arccos|arctan)\(|(?<![a-z])[a-z](?![a-z])|[()+\-*/^]'
        token_list: List = sub(r' {2,}', ' ', sub(regex, r' \g<0> ', cell.replace(' ', '')).strip()).split(' ')
        if not all(map(lambda t: fullmatch(regex, t), token_list)):
            print('invalid token')
            return invalid

        for i in range(len(token_list)):
            if token_list[i] == '-' and (i == 0 or not fullmatch(r'\d+(?:\.\d+)?|[)a-z]', token_list[i - 1])):
                if i + 1 == len(token_list):
                    return invalid
                elif token_list[i - 1] == '^':
                    token_list[i] = '---'
                else:
                    token_list[i] = "--"

        brackets = 0
        operations = []
        operators = {"---": 8, "--": 6, "+": 4, "-": 4, "*": 5, "/": 5, "^": 7}
        for i in range(len(token_list)):
            token = token_list[i]
            if fullmatch(r'-?\d+(?:\.\d+)?', token):
                token_list[i] = [float(token)] + [0] * var_count
            elif token in var_list:
                token_list[i] = list(map(lambda x: 1 if token == var_list[x] else 0, range(var_count)))
            elif token in operators:
                token_list[i] = token, brackets + 1000 * operators[token] - i
                operations.append(token_list[i])
            elif token.endswith('('):
                token_list[i] = token, brackets + 8000 - i
                operations.append(token_list[i])
                brackets += 10000
            elif token == ')':
                brackets -= 10000
            else:
                print("Something went wrong when handling this token: '" + token + "'")
                return invalid
            if brackets < 0:
                return invalid
        if brackets != 0:
            return invalid

        operations.sort(key=lambda item: item[1], reverse=True)

        for i in range(len(operations)):
            operation = operations[i][0]
            pos = token_list.index(operations[i])
            if operation in ('---', '--'):
                if pos == len(token_list) - 1 or not isinstance(token_list[pos + 1], list):
                    return invalid
                token_list.pop(pos)
                token_list[pos] = list(map(lambda x: -x, token_list[pos]))
            elif operation in ('+', '-', '*', '/', '^'):
                if pos == 0 or pos == len(token_list) - 1 or not isinstance(token_list[pos - 1], list) \
                        or not isinstance(token_list[pos + 1], list):
                    return invalid
                pos -= 1
                args = token_list.pop(pos), token_list.pop(pos + 1)
                if operation == '+':
                    token_list[pos] = list(map(lambda x, y: x + y, *args))
                elif operation == '-':
                    token_list[pos] = list(map(lambda x, y: x - y, *args))
                elif operation == '*':
                    has_vars = tuple(map(lambda x: any(map(lambda y: y != 0, x[1:])), args))
                    if all(has_vars):
                        print("Can't multiply variables with other variables")
                        return invalid
                    if has_vars[0]:
                        args = [args[1], args[0]]
                    token_list[pos] = list(map(lambda x: args[0][0] * x, args[1]))
                elif operation == '/':
                    if args[1][0] == 0 or any(map(lambda x: x != 0, args[1])):
                        print("Can't divide by variables, or by zero")
                        return invalid
                    token_list[pos] = list(map(lambda x: x / args[1][0], args[0]))
                elif operation == '^':
                    if any(map(lambda x: any(map(lambda y: y != 0, x[1:])), args)):
                        print("Can't do exponents with variables")
                        return invalid
                    token_list[pos] = [args[0][0] ** args[1][0]] + [0] * (var_count - 1)
                else:
                    raise Exception("An unknown error occurred")
            elif operation in ('(', 'sqrt(', 'sin(', 'cos(', 'tan(', 'arcsin(', 'arccos(', 'arctan('):
                if pos > len(token_list) - 3 or not isinstance(token_list[pos + 1], list) or token_list[pos + 2] != ')':
                    return invalid
                token_list.pop(pos + 2)
                arg = token_list.pop(pos + 1)
                if operation == '(':
                    token_list[pos] = arg
                elif any(map(lambda y: y != 0, arg[1:])):
                    return invalid
                elif operation == 'sqrt(':
                    token_list[pos] = [sqrt(arg[0])] + [0] * (var_count - 1)
                elif operation == 'sin(':
                    token_list[pos] = [sin(arg[0] * pi / 180)] + [0] * (var_count - 1)
                elif operation == 'cos(':
                    token_list[pos] = [cos(arg[0] * pi / 180)] + [0] * (var_count - 1)
                elif operation == 'tan(':
                    token_list[pos] = [tan(arg[0] * pi / 180)] + [0] * (var_count - 1)
                elif operation == 'arcsin(':
                    token_list[pos] = [asin(arg[0]) * 180 / pi] + [0] * (var_count - 1)
                elif operation == 'arccos(':
                    token_list[pos] = [acos(arg[0]) * 180 / pi] + [0] * (var_count - 1)
                elif operation == 'arctan(':
                    token_list[pos] = [atan(arg[0]) * 180 / pi] + [0] * (var_count - 1)
                else:
                    raise Exception("An unknown error occurred")
            else:
                print("Something went wrong when evaluating '" + operation + "'")
                return invalid

        if len(token_list) > 1:
            return invalid
        lists += token_list
    vector = matrix(map(lambda x: [x.pop(0)], lists))
    free_vars = basis(map(lambda x: matrix(map(lambda y: [lists[y][x]], range(vector.rows))), range(var_count - 1)),
                      vector.rows)
    return vector_free_vars(vector, free_vars)


def build_polynomial(cell: str):
    invalid = error('invalid expression')
    regex = r'\d+(?:\.\d+)?|[()+\-*/^x]'
    token_list: List = sub(r' {2,}', ' ', sub(regex, r' \g<0> ', cell.replace(' ', '')).strip()).split(' ')
    if not all(map(lambda t: fullmatch(regex, t), token_list)):
        print('invalid token')
        return invalid

    for i in range(len(token_list)):
        if token_list[i] == '-' and (i == 0 or not fullmatch(r'\d+(?:\.\d+)?|[)x]', token_list[i - 1])):
            if i + 1 == len(token_list):
                return invalid
            elif token_list[i - 1] == '^':
                token_list[i] = '---'
            else:
                token_list[i] = "--"

    brackets = 0
    operations = []
    operators = {"---": 8, "--": 6, "+": 4, "-": 4, "*": 5, "/": 5, "^": 7}
    for i in range(len(token_list)):
        token = token_list[i]
        if fullmatch(r'-?\d+(?:\.\d+)?', token):
            token_list[i] = [float(token)]
        elif token == 'x':
            token_list[i] = [0, 1]
        elif token in operators:
            token_list[i] = token, brackets + 1000 * operators[token] - i
            operations.append(token_list[i])
        elif token.endswith('('):
            token_list[i] = token, brackets + 8000 - i
            operations.append(token_list[i])
            brackets += 10000
        elif token == ')':
            brackets -= 10000
        else:
            print("Something went wrong when handling this token: '" + token + "'")
            return invalid
        if brackets < 0:
            return invalid
    if brackets != 0:
        return invalid

    operations.sort(key=lambda item: item[1], reverse=True)

    for i in range(len(operations)):
        operation = operations[i][0]
        pos = token_list.index(operations[i])
        if operation in ('---', '--'):
            if pos == len(token_list) - 1 or not isinstance(token_list[pos + 1], list):
                return invalid
            token_list.pop(pos)
            token_list[pos] = list(map(lambda t: -t, token_list[pos]))
        elif operation in ('+', '-', '*', '/', '^'):
            if pos == 0 or pos == len(token_list) - 1 or not isinstance(token_list[pos - 1], list) \
                    or not isinstance(token_list[pos + 1], list):
                return invalid
            pos -= 1
            args = [token_list.pop(pos), token_list.pop(pos + 1)]
            if operation == '+':
                if len(args[0]) < len(args[1]):
                    args[0] += [0] * (len(args[1]) - len(args[0]))
                elif len(args[0]) > len(args[1]):
                    args[1] += [0] * (len(args[0]) - len(args[1]))
                token_list[pos] = list(map(lambda s, t: s + t, *args))
            elif operation == '-':
                if len(args[0]) < len(args[1]):
                    args[0] += [0] * (len(args[1]) - len(args[0]))
                elif len(args[0]) > len(args[1]):
                    args[1] += [0] * (len(args[0]) - len(args[1]))
                token_list[pos] = list(map(lambda s, t: s - t, *args))
            elif operation == '*':
                result = [0] * (len(args[0]) + len(args[1]) - 1)
                for x in range(len(args[0])):
                    for z in range(len(args[1])):
                        result[x + z] += args[0][x] * args[1][z]
                token_list[pos] = result
            elif operation == '/':
                if args[1][0] == 0 or len(args[1]) > 1:
                    print("Can't divide by polynomial, or by zero")
                    return invalid
                token_list[pos] = list(map(lambda t: t / args[1][0], args[0]))
            elif operation == '^':
                if len(args[1]) > 1:
                    return invalid
                if len(args[0]) == 1:
                    token_list[pos] = [args[0][0] ** args[1][0]]
                else:
                    if abs(args[1][0] - round(args[1][0])) > 0.0001 or args[1][0] < 0:
                        return invalid
                    final_result = [1]
                    for x in range(round(args[1][0])):
                        result = [0] * (len(args[0]) + len(final_result) - 1)
                        for y in range(len(args[0])):
                            for z in range(len(final_result)):
                                result[y + z] += args[0][y] * final_result[z]
                        final_result = result
                    token_list[pos] = final_result
            else:
                raise Exception("An unknown error occurred")
        elif operation == '(':
            if pos > len(token_list) - 3 or not isinstance(token_list[pos + 1], list) or token_list[pos + 2] != ')':
                return invalid
            token_list.pop(pos + 2)
            token_list[pos] = token_list.pop(pos + 1)
        else:
            print("Something went wrong when evaluating '" + operation + "'")
            return invalid

    if len(token_list) > 1:
        return invalid
    return polynomial(token_list[0])


def parse_answer(i, answer, answer_type, prompt):
    ans = error('Invalid answer')
    try:
        if len(str(answer)) == 0 and answer_type not in ('0', '1'):
            ans = error("No answer given")
        elif answer_type == '0':  # True/False
            if answer is True:
                ans = tf_ans(True, prompt)
            elif answer is False:
                ans = tf_ans(False, prompt)
            else:
                ans = tf_ans(None, prompt)
        elif answer_type == '1':  # Multiple Choice
            if fullmatch(r'\d+', str(answer)):
                ans = mc_ans(int(answer) + 1, prompt)
            else:
                ans = mc_ans(None, prompt)
        elif answer_type == '2':  # Number
            ans = build_number(answer)
        elif answer_type == '3':  # Linear Expression
            raise NotImplementedError
        elif answer_type == '4':  # Any, None, or comma-separated list of numbers
            if answer == 'any':
                ans = boolean(True)
            elif answer == 'none':
                ans = boolean(False)
            else:
                x = matrix(map(lambda r: [build_number(r)], answer.split(',')))
                if x.type == MATRIX:
                    ans = x
        elif answer_type == '5':  # Polynomial
            raise NotImplementedError
        elif answer_type == '6':  # Vector
            ans = matrix(map(lambda r: [build_number(r)], answer.split(',')))
        elif answer_type == '7':  # Vector of linear expressions
            ans = build_vector_free_vars(answer)
        elif answer_type == '8':  # Matrix
            array = map(lambda x: x.split(','), answer.split('\n'))
            ans = matrix(map(lambda r: map(lambda c: build_number(c), r), array))
        elif answer_type == '9':  # Basis
            # Todo: Fix this on the front end so the list doesn't need to be filtered
            array = list(map(lambda x: x.split(','), answer.split('\n')))
            rows = len(array[0])
            ans = basis(map(lambda vector: matrix(map(lambda r: [build_number(r)], vector)), array), rows)
            if get_types(ans) == BASIS and ans.cols != len(array):
                ans = error('Invalid Basis')
    except Exception:
        pass
    ans.explanation = ([(r'\color{{DarkOrange}}{{\text{{Answer {}}}}}'.format(i + 1), 8),
                        (r'\color{DarkOrange}{' + repr(ans) + '}', 8)])
    return ans
