from server.MathCode.AvoVariable import AvoVariable, AvoRandom,\
    MATRIX, error, boolean, number, matrix, basis, mc_ans, tf_ans, vector_free_vars, polynomial
from inspect import signature
from math import sqrt, sin, cos, tan, asin, acos, atan, pi
from re import fullmatch, sub, search
from typing import List, Any


class AvoQuestion:
    def __init__(self, question: str, seed=0):
        """
        Takes in question specifications, initializes object with relevant properties to display
        'self' --> the object the method is called on (think variable.lower(), 'variable' would be 'self')
        'question: str' --> tells compiler a string is being taken in so it can give warnings/suggestions accordingly
        'seed' --> number the random generator uses as a starting point
        """
        question = question.split('；')  # splits question string at each ';' into list of strings
        if len(question) != 5:      # ensures the list of strings is 6 parts
            raise SyntaxError(f'Received wrong number of parts: {len(question)}')
        self.steps, self.prompts, self.types, self.notes, _ = map(lambda x: x.split('，'), question)
        # puts each string from the split string list into variables before the equals sign

        self.random = AvoRandom(seed)
        self.score = 0
        self.scores = []
        self.explanation = []
        self.var_list = []
        self.str_list = []
        self.ans_list = []
        self.totals = []

        while len(self.steps) > 0 and '@' not in self.steps[0]:     # '@' doesnt execute until answers are evaluated
            self.step(self.steps.pop(0))

        try:
            self.prompts = tuple(map(lambda prompt: prompt.format(*self.str_list), self.prompts))
            self.notes = list(map(lambda prompt: prompt.format(*self.str_list), self.notes))

        except IndexError:
            raise SyntaxError("Error: undefined string variable reference")
        self.prompt, self.prompts = self.prompts[0], self.prompts[1:]

        if len(self.prompts) != len(self.types):    # ensures there are the same number of prompts as answer fields
            raise SyntaxError("The number of prompts and answer fields don't match")

    def step(self, token_list):
        """
        Generates a single step/part of the question being generated based on the parameter passed in
        'self' --> the object the method is called on (think variable.lower(), 'variable' would be 'self')
        'token_list' --> question in postfix notation form in a list
        """
        token_list = token_list.split(' ')
        stack = []
        for token in token_list:
            # >> Variable Reference
            if fullmatch(r'\$\d+', token):
                index = int(token[1:])
                if index < len(self.var_list):
                    stack.append(self.var_list[index])
                else:
                    raise SyntaxError(f"Error: undefined variable reference: '${index + 1}'")
            # >> Answer Reference
            elif fullmatch(r'@\d+', token):
                index = int(token[1:])
                if index < len(self.ans_list):
                    stack.append(self.ans_list[index])
                else:
                    raise SyntaxError(f"Error: undefined answer variable reference: '@{index + 1}'")
            # >> Literal Number (Integer)
            elif fullmatch(r'-?\d+(\.\d+)?', token):
                stack.append(number(float(token)))
            elif fullmatch(r'\d+%\d+', token):
                args = token.split('%')
                stack.append(number(args[0], args[1]))
            elif token == '*T':
                stack.append(boolean(True))
            elif token == '*F':
                stack.append(boolean(False))
            # >> Build Matrix
            elif token == ']':
                rows, cols = int(stack.pop(-2)), int(stack.pop(-1))
                arg_count = rows * cols
                stack, args = stack[:-arg_count], stack[-arg_count:]
                stack.append(matrix(map(lambda a: args[cols * a: cols * (a + 1)], range(rows)), args[0].mod))
            # >> Build Basis
            elif token == '}':
                vectors = int(stack.pop(-1))
                stack, args = stack[:-vectors], stack[-vectors:]
                stack.append(basis(args, args[0].rows, args[0].mod))
            # >> Method call
            elif token in methods:
                method = methods[token]
                is_q = 'AvoQuestion' in str(method)
                is_r = 'AvoRandom' in str(method)
                arg_count = -len(signature(method).parameters) + (1 if is_q or is_r else 0)
                stack, args = stack[:arg_count], stack[arg_count:]
                try:
                    if is_q:
                        result = method(self, *args)
                    elif is_r:
                        result = method(self.random, *args)
                    else:
                        result = method(*args)
                except SyntaxError:
                    result = error('unknown error')
                if isinstance(result, tuple):
                    stack += list(result)
                elif isinstance(result, AvoVariable):
                    stack.append(result)
                elif isinstance(result, str):
                    self.str_list.append(result)
            else:
                raise SyntaxError(token)
        self.var_list += stack

    def get_score(self, *answers):
        """
        Gives the (student) a score based off how the question was solved versus what was asked (server call)
        """
        if len(answers) != len(self.types):
            raise ValueError("Wrong number of answers")
        for i in range(len(answers)):
            answer: Any = answers[i]
            answer_type = self.types[i]
            ans = error('Invalid answer')
            try:
                if len(str(answer)) == 0 and answer_type not in ('0', '1'):
                    ans = error("No answer given")
                elif answer_type == '0':  # True/False
                    if answer is True:
                        ans = tf_ans(True, self.prompts[i])
                    elif answer is False:
                        ans = tf_ans(False, self.prompts[i])
                    else:
                        ans = tf_ans(None, self.prompts[i])
                elif answer_type == '1':  # Multiple Choice
                    if fullmatch(r'\d+', str(answer)):
                        ans = mc_ans(int(answer) + 1, self.prompts[i])
                    else:
                        ans = mc_ans(None, self.prompts[i])
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
                    answer = filter(lambda vector: any(map(lambda c: c != '', vector)), array)
                    ans = basis(map(lambda vector: matrix(map(lambda r: [build_number(r)], vector)), array), rows)
            except Exception:
                pass
            ans.explanation = ([(r'\color{{DarkOrange}}{{\text{{Answer {}}}}}'.format(i + 1), 8),
                                (r'\color{DarkOrange}{' + repr(ans) + '}', 8)])
            self.ans_list.append(ans)
        while len(self.steps) != 0:
            self.step(self.steps.pop(0))
        return self.score

    def increment_score(self, condition, amount):
        """
        Marks a single criteria/part of the generated question
        'condition' --> true or false object (AvoVariable) to determine whether to give the student points or not
        --> also contains an explanation for how the answer was reached to generate explanation for question
        'amount' --> amount of points to be granted, if the student is correct
        """
        if str(self.notes[0]).startswith('/'):
            self.explanation.append(self.notes[0][1:])
        else:
            if condition.explanation[0][1] == -1:
                step = condition.explanation[0][0] + r'\(\\\)'
            else:
                step = rf'For \({amount}\) point{"s" if float(amount) > 1 else ""}, the following expression must be ' \
                       rf'true:\[{condition.explanation[0][0]}\]'
                if len(condition.explanation) > 2:
                    step += 'This can be simplified as follows:'
                    for s in condition.explanation[1:-1]:
                        step += r'\[' + s[0] + r'\]'
            if self.notes[0] != '':
                step += r'\(\\\)Notes:\(\\\)' + self.notes[0]
            self.explanation.append(step)
        self.notes.pop(0)
        if condition:
            self.score += float(amount)
            self.scores.append(float(amount))
        else:
            self.scores.append(0)
        self.totals.append(float(amount))


methods = {     # Function calls mapped to abbreviations for simplified calls
    # *#    Variable reference
    # #     Literal number
    # ]     Build matrix
    # }     Build basis
    # *T|*F Literal boolean

    '%': AvoQuestion.increment_score,

    'AA': AvoRandom.boolean,
    'AB': AvoRandom.number,
    'AC': AvoRandom.matrix,
    'AD': AvoRandom.code_vector,
    'AE': AvoRandom.matrix_rank,
    'AF': AvoRandom.matrix_eigenvector,
    # 'AG': Removed
    'AH': AvoRandom.matrix_rank_mod5,
    'AI': AvoRandom.basis_orthogonal,

    'BA': lambda x, y: x | y,
    'BB': lambda x, y: x & y,
    'BC': lambda x: ~x,
    'BD': lambda x, y, z: y if x else z,

    'CA': lambda x: -x,
    'CB': lambda x, y: x + y,
    'CC': lambda x, y: x - y,
    'CD': lambda x, y: x * y,
    'CE': lambda x, y: x / y,
    'CF': lambda x, y: x % y,
    'CG': lambda x, y: x ** y,

    'CN': lambda x, y: x == y,
    'CO': lambda x, y: x != y,
    'CP': lambda x, y: x >= y,
    'CQ': lambda x, y: x <= y,
    'CR': lambda x, y: x > y,
    'CS': lambda x, y: x < y,

    'DA': AvoVariable.sqrt,
    'DB': AvoVariable.sin,
    'DC': AvoVariable.cos,
    'DD': AvoVariable.tan,
    'DE': AvoVariable.arcsin,
    'DF': AvoVariable.arccos,
    'DG': AvoVariable.arctan,
    'DH': AvoVariable.rotation,
    'DI': AvoVariable.reflection,

    'EA': AvoVariable.is_v,
    'EB': AvoVariable.dot,
    'EC': AvoVariable.cross,
    'ED': AvoVariable.norm,
    'EE': AvoVariable.angle,
    'EF': AvoVariable.projection,

    'FA': AvoVariable.scalar_of,
    'FB': AvoVariable.similar_to,
    'FC': AvoVariable.transpose,
    'FD': AvoVariable.get,
    'FE': AvoVariable.set,
    'FF': AvoVariable.adjugate,
    'FG': AvoVariable.det,
    'FH': AvoVariable.inverse,
    'FI': AvoVariable.rref,
    'FJ': AvoVariable.row_space,
    'FK': AvoVariable.column_space,
    'FL': AvoVariable.null_space,
    'FM': AvoVariable.eigenspaces,
    'FN': AvoVariable.diagonal,
    'FO': AvoVariable.rank,
    'FP': AvoVariable.char_poly,

    'GA': AvoVariable.contains,
    'GB': AvoVariable.in_span,
    'GC': AvoVariable.is_normal,
    'GD': AvoVariable.is_orthogonal,
    'GE': AvoVariable.exactly_equal,
    'GF': AvoVariable.gram_schmidt,
    # 'GG': Removed
    'GH': AvoVariable.projection_matrix,
    'GI': AvoVariable.normalize,
    'GJ': AvoVariable.dim,
    'GK': AvoVariable.as_matrix,

    'HA': AvoVariable.multiple_choice,
    'HB': AvoVariable.true_false,
    'HC': AvoVariable.reset,

    '_A': lambda x: repr(x),
    '_B': AvoVariable.system_of_equations,
    '_C': AvoVariable.highlight_pivots,
    '_D': AvoVariable.vector_free_vars,
    '_E': AvoVariable.vector_as_point,
    '_F': AvoVariable.augment,
}


def build_number(text: str):
    """
    Converts string expression into a number (takes string and converts into AvoVariable)
    'text: str' --> tells compiler a string is being taken in so it can give warnings/suggestions accordingly
    """
    invalid = error('invalid expression')
    regex = r'\d+(?:\.\d+)?|(sqrt|sin|cos|tan|arcsin|arccos|arctan)\(|[()+\-*/^]'
    token_list: List = sub(r' {2,}', ' ', sub(regex, r' \g<0> ', text.replace(' ', '')).strip()).split(' ')
    if not all(map(lambda t: fullmatch(regex, t), token_list)):
        return invalid

    for i in range(len(token_list)):    # determines which minus signs are negative signs, and priority of negatives
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

    for i in range(len(token_list)):    # figures out the order of operations
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

    for i in range(len(operations)):    # uses above loop's order of operations to assist in evaluating to a number
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
    """
    Converts string expression into vector for generated question
    """
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
    """
    Converts string expression into polynomial for question generated
    """
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
