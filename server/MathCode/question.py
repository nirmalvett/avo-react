from server.MathCode.AnswerUtilities import parse_answer
from server.MathCode.AvoVariable import AvoVariable, AvoRandom, error, boolean, number, matrix, basis
from inspect import signature
from re import fullmatch
from server.MathCode.question2 import AvoQuestion as AvoQuestion2


class AvoQuestion:
    def __init__(self, question: str, seed=0, answers=None):
        self._alternate = question.count('；') == 8  # 9 segments
        if self._alternate:
            self._q = AvoQuestion2(question, seed, answers)
            self.prompt = self._q.prompt
            self.prompts = self._q.prompts
            self.types = self._q.types
            self.var_list = self._q.var_list
            self.score = self._q.score
            self.scores = self._q.scores
            self.totals = self._q.totals
            self.explanation = self._q.explanation
            return
        question = question.split('；')
        if len(question) != 5:
            raise SyntaxError(f'Received wrong number of parts: {len(question)}')
        self.steps, self.prompts, self.types, self.notes, _ = map(lambda x: x.split('，'), question)

        self.random = AvoRandom(seed)
        self.score = 0
        self.scores = []
        self.explanation = []
        self.var_list = []
        self.str_list = []
        self.ans_list = []
        self.totals = []

        while len(self.steps) > 0 and '@' not in self.steps[0]:
            self.step(self.steps.pop(0))

        try:
            self.prompts = tuple(map(lambda prompt: prompt.format(*self.str_list), self.prompts))
            self.notes = list(map(lambda prompt: prompt.format(*self.str_list), self.notes))
        except IndexError:
            raise SyntaxError("Error: undefined string variable reference")
        self.prompt, self.prompts = self.prompts[0], self.prompts[1:]

        if len(self.prompts) != len(self.types):
            raise SyntaxError("The number of prompts and answer fields don't match")

        if answers is not None:
            if len(answers) != len(self.types):
                if all(map(lambda a: a == '', answers)):
                    answers = [''] * len(self.types)
                else:
                    raise ValueError("Wrong number of answers")
            for i in range(len(answers)):
                self.ans_list.append(parse_answer(i, answers[i], self.types[i], self.prompts[i]))
            while len(self.steps) != 0:
                self.step(self.steps.pop(0))

    def step(self, token_list):
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

    def increment_score(self, condition, amount):
        if str(self.notes[0]).startswith('/'):
            self.explanation.append(self.notes[0][1:])
        else:
            if condition.explanation[0][1] == -1:
                step = condition.explanation[0][0] + r'$\\$'
            else:
                step = rf'For \({amount}\) point{"s" if float(amount) != 1 else ""}, the following expression must be ' \
                       rf'true:\[{condition.explanation[0][0]}\]'
                if len(condition.explanation) > 2:
                    step += 'This can be simplified as follows:'
                    for s in condition.explanation[1:-1]:
                        step += r'\[' + s[0] + r'\]'
            if self.notes[0] != '':
                step += r'$\\$Notes:$\\$' + self.notes[0]
            self.explanation.append(step)
        self.notes.pop(0)
        if condition:
            self.score += float(amount)
            self.scores.append(float(amount))
        else:
            self.scores.append(0)
        self.totals.append(float(amount))


methods = {
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
