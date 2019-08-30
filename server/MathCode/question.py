from server.MathCode.AnswerUtilities import parse_answer
from server.MathCode.AvoVariable import AvoVariable, AvoRandom, error, boolean, number, matrix, basis
from inspect import signature
from re import fullmatch

SEP1 = '；'
SEP2 = '，'
SEP3 = '—'


# q = AvoQuestion(string: str, seed: int)
#   This can be used to initialize a question. It only does the steps necessary to generate the prompts.
# q.prompt
#   This contains the main prompt
# q.prompts
#   This contains a list of sub-prompts
# q.types
#   This contains a list of variable types

# q.get_score(*answers: list(str))
#   This can be used to mark a question. It does the extra steps that were not done by the constructor.
# q.score
#   This contains the student's total score
# q.scores
#   This contains the list of scores for each part
# q.totals
#   This contains the list of maximum scores for each part
# q.explanation
#   This contains an array of explanations for each part

# q.var_list
#   This contains the list of variables

class AvoQuestion:
    def __init__(self, question: str, seed=0, answers=None):
        question = tuple(map(lambda x: x.split(SEP2), question.split(SEP1)))
        if len(question) != 9:
            raise SyntaxError(f'Received wrong number of parts: {len(question)}')
        _math, _var_names, _strings, _prompts, self.types, self._points, self._criteria, _explanations, _ = question
        if _strings == ['']:
            _strings = []
        if self.types == ['']:
            self.types = []

        self.random = AvoRandom(seed)
        self.score = 0
        self.scores = []
        self.explanation = []
        self.var_list = {
            '$pi': number(3.141592653589793),
            '$e': number(2.718281828459045),
        }
        self.str_list = []
        self.ans_list = []
        self.totals = []
        self.steps = [] if _math == [''] else _math

        for i in range(len(self.steps)):
            result = self._step(self.steps[i])
            var_names = _var_names[i].split(SEP3)
            for j in range(min(len(result), len(var_names))):
                self.var_list[var_names[j]] = result[j]

        for i in range(len(_strings)):
            string = self._step(_strings[i])
            if len(string) != 1:
                raise SyntaxError("Each string expression must return exactly one string")
            self.str_list.append(string[0])

        self.prompts = list(map(lambda x: x.format(*self.str_list), _prompts))
        formatted_explanations = list(map(lambda x: x.format(*self.str_list), _explanations))
        self.prompt, self.prompts = self.prompts[0], self.prompts[1:]

        if len(self.prompts) != len(self.types):
            print(self.prompts)
            print(self.types)
            raise SyntaxError("The number of prompts and answer fields don't match")

        if answers is not None:
            # Read in the answer list
            if len(answers) != len(self.types):
                if all(map(lambda a: a == '', answers)):
                    answers = [''] * len(self.types)
                else:
                    raise ValueError("Wrong number of answers")
            for i in range(len(self.types)):
                self.ans_list.append(parse_answer(i, answers[i], self.types[i], self.prompts[i], self))

            # Evaluate the criteria
            for i in range(len(self._criteria)):
                condition = self._step(self._criteria[i])[0]
                amount = self._points[i]

                explanation = formatted_explanations[i]
                if str(explanation).startswith('/'):
                    self.explanation.append(explanation[1:])
                else:
                    if condition.explanation[0][1] == -1:
                        step = condition.explanation[0][0] + r'$\\$'
                    else:
                        step = rf'For \({amount}\) point{"" if float(amount) == 1 else "s"}, ' \
                               rf'the following expression must be true:\[{condition.explanation[0][0]}\]'
                        if len(condition.explanation) > 2:
                            step += 'This can be simplified as follows:'
                            for s in condition.explanation[1:-1]:
                                step += r'\[' + s[0] + r'\]'
                    if explanation != '':
                        step += r'$\\$Notes:$\\$' + explanation
                    self.explanation.append(step)
                if condition:
                    self.score += float(amount)
                    self.scores.append(float(amount))
                else:
                    self.scores.append(0)
                self.totals.append(float(amount))

    def _step(self, token_list):
        token_list = token_list.split(' ')
        stack = []
        for token in token_list:
            # >> Variable Reference
            if fullmatch(r'\$\w+', token):
                if token in self.var_list:
                    stack.append(self.var_list[token])
                else:
                    raise SyntaxError(f"Error: undefined variable reference: '{token}',"
                                      f" in user defined dict {self.var_list}")
            # >> Answer Reference
            elif fullmatch(r'@\d+', token):
                index = int(token[1:])
                if index < len(self.ans_list):
                    stack.append(self.ans_list[index])
                else:
                    raise SyntaxError(f"Error: undefined answer variable reference: '@{index}'")
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
                is_r = 'AvoRandom' in str(method)
                arg_count = -len(signature(method).parameters) + (1 if is_r else 0)
                stack, args = stack[:arg_count], stack[arg_count:]
                try:
                    if is_r:
                        result = method(self.random, *args)
                    else:
                        result = method(*args)
                except SyntaxError:
                    result = error('unknown error')
                if isinstance(result, tuple) or isinstance(result, list):
                    stack += list(result)
                else:
                    stack.append(result)
            else:
                raise SyntaxError(token)
        return stack


methods = {
    # #     Literal number
    # ]     Build matrix
    # }     Build basis
    # *T|*F Literal boolean

    'AA': AvoRandom.boolean,
    'AB': AvoRandom.number,
    'AC': AvoRandom.matrix,
    'AD': AvoRandom.code_vector,
    'AE': AvoRandom.matrix_rank,
    'AF': AvoRandom.matrix_eigenvector,
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
    'GH': AvoVariable.projection_matrix,
    'GI': AvoVariable.normalize,
    'GJ': AvoVariable.dim,
    'GK': AvoVariable.as_matrix,

    'HA': AvoVariable.multiple_choice,
    'HB': AvoVariable.true_false,
    'HC': AvoVariable.reset,

    "LN": AvoVariable.ln,

    '_A': lambda x: repr(x),
    '_B': AvoVariable.system_of_equations,
    '_C': AvoVariable.highlight_pivots,
    '_D': AvoVariable.vector_free_vars,
    '_E': AvoVariable.vector_as_point,
    '_F': AvoVariable.augment,
}
