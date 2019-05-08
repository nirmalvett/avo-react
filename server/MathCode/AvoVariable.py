from collections import Iterable
from math import sqrt, pi, sin, cos, tan, asin, acos, atan, factorial, log
from re import sub
from typing import List, Any

from sympy import Matrix

ERROR, BOOLEAN, NUMBER, MATRIX, BASIS, MC_ANS, TF_ANS, VECTOR_FREE_VARS, POLYNOMIAL = range(9)
invalid_argument = 'Invalid argument'
undefined = 'undefined'


def error(val, explanation=()):
    if isinstance(val, str):
        return AvoVariable(ERROR, val, explanation)
    print("Error initialized with non-string argument")
    return error(invalid_argument, explanation)


def boolean(val, explanation=()):
    if isinstance(val, bool):
        return AvoVariable(BOOLEAN, val, explanation)
    print("Boolean initialized with non-boolean argument")
    return error(invalid_argument, explanation)


def number(val, mod=0, explanation=()):
    if not (isinstance(val, (int, float)) and isinstance(mod, int)):
        print("Number initialized with non-numeric arguments")
        return error(invalid_argument, explanation)
    elif mod == 0 or mod == 1:
        return AvoVariable(NUMBER, exact(val), explanation)
    elif mod >= 2 and abs(val - round(val)) < 0.0001:
        return AvoVariable(NUMBER, round(val) % mod, explanation, mod)
    else:
        print("Number initialized with invalid values:", val, "mod", mod)
        return error(invalid_argument, explanation)


def matrix(val, mod=0, explanation=()):
    if not isinstance(mod, int) or mod < 0:
        print("Matrix initialized with non-integer modulo")
        return error(invalid_argument, explanation)
    mod = 0 if mod == 1 else mod
    if isinstance(val, Matrix):
        # noinspection PyProtectedMember
        values = val._mat
        val = [values[i:i + val.cols] for i in range(0, len(values), val.cols)]
    if not isinstance(val, Iterable):
        print("Matrix initialized with non-iterable matrix")
        return error(invalid_argument, explanation)
    val = tuple(val)
    if not all(map(lambda x: isinstance(x, Iterable), val)):
        print("Matrix initialized with non-iterable rows")
        return error(invalid_argument, explanation)
    array = tuple(map(lambda r: tuple(r), val))
    if len(array) == 0:
        print("Matrix initialized with no rows")
        return error(invalid_argument, explanation)
    rows, cols = len(array), len(array[0])
    if cols == 0:
        print("Matrix initialized with no columns")
        return error(invalid_argument, explanation)
    if not all(map(lambda x: len(x) == cols, array)):
        print("Matrix initialized with uneven row lengths")
        return error(invalid_argument, explanation)
    try:
        array = list(map(lambda r: list(map(lambda c: number(float(c), mod), r)), array))
    except ValueError:
        print("Matrix initialized with non-numeric cells")
        return error(invalid_argument, explanation)
    if not all(map(lambda r: all(map(lambda c: c.type == NUMBER, r)), array)):
        print("Matrix initialized with invalid numbers")
        return error(invalid_argument, explanation)
    return AvoVariable(MATRIX, array, explanation, mod, rows, cols)


def basis(val, rows, mod=0, explanation=()):
    if not isinstance(rows, int) or rows < 1:
        print("Basis initialized with invalid number of rows")
        return error(invalid_argument, explanation)
    if not isinstance(mod, int) or mod < 0 or mod == 1:
        print("Basis initialized with invalid mod")
        return error(invalid_argument, explanation)
    if not isinstance(val, Iterable):
        print("Basis initialized with non-iterable")
        return error(invalid_argument, explanation)
    val = tuple(val)
    if not all(map(lambda x: isinstance(x, AvoVariable) and x.is_v(), val)):
        print("Basis initialized with non-vector")
        return error(invalid_argument, explanation)
    if not all(map(lambda x: x.rows == rows, val)):
        print("Basis initialized with vectors of the wrong length")
        return error(invalid_argument, explanation)
    val = list(map(lambda vector: vector if vector.mod == mod else matrix(vector.val, mod), val))
    if any(map(lambda vector: vector.type != MATRIX, val)):
        print("Basis initialized with invalid modulo vector")
        return error(invalid_argument, explanation)
    vectors = []
    if mod == 0:
        proj = matrix([[0] * rows] * rows)
        for v in val:
            orthogonal = v - proj * v
            if orthogonal != 0:
                vectors.append(v)
                proj += orthogonal * orthogonal.transpose() / orthogonal.dot(orthogonal)
        return AvoVariable(BASIS, vectors, explanation, 0, rows, len(vectors), proj.reset())
    else:
        pivots: List[Any] = [None] * rows
        for v in val:
            copy = v
            for y in range(rows):
                if copy.val[y][0] != 0:
                    if pivots[y] is None:
                        pivots[y] = copy / copy.val[y][0]
                        vectors.append(v)
                        break
                    else:
                        copy = copy / copy.val[y][0] - pivots[y]
        return AvoVariable(BASIS, vectors, explanation, mod, rows, len(vectors))


def mc_ans(val, prompt):
    return AvoVariable(MC_ANS, (val, prompt.split("—")))


def tf_ans(val, prompt):
    return AvoVariable(TF_ANS, (val, prompt))


def vector_free_vars(vector, free_vars, explanation=()):
    types = get_types(vector, free_vars)
    if types != (MATRIX, BASIS) or not vector.is_v() or vector.rows != free_vars.rows:
        return error(invalid_argument, explanation)
    return AvoVariable(VECTOR_FREE_VARS, [vector, free_vars], explanation, 0, vector.rows)


def polynomial(val, mod=0, explanation=()):
    if not isinstance(val, Iterable) or not isinstance(mod, int):
        return error(invalid_argument, explanation)
    try:
        val = tuple(map(lambda x: number(float(x), mod), val))
    except ValueError:
        return error(invalid_argument, explanation)
    while len(val) > 0 and val[-1] == 0:
        val = val[:-1]
    return AvoVariable(POLYNOMIAL, val, explanation, mod)


def fraction(n):
    value, numbers, length = abs(n), [], 0
    while length < 20:
        numbers.append(int(value))
        length += 1
        value %= 1
        if value < 0.0001:
            break
        value = 1 / value
    if length == 20:
        return
    num, den = numbers.pop(-1), 1
    while len(numbers) != 0:
        num, den = den + num * numbers.pop(-1), num
    if n < 0:
        return -num, den
    else:
        return num, den


def exact(n):
    n = float(n)
    frac = fraction(n)
    if frac is not None:
        return frac[0] / frac[1]
    return n


def inverse(n, base):
    t, new_t, r, new_r = 0, 1, base, n
    while new_r != 0:
        quotient = r // new_r
        t, new_t = new_t, t - quotient * new_t
        r, new_r = new_r, r - quotient * new_r
    if r <= 1:
        return t


def steps(s, p, args, priorities):
    for arg in args:
        if not isinstance(arg, AvoVariable):
            return ()
    result = []
    count = 0
    for arg in args:
        count = max(count, len(arg.explanation))
    for i in range(count):
        x = []
        for arg, priority in zip(args, priorities):
            explanation = arg.explanation
            step = explanation[min(i, len(explanation) - 1)]
            if priority > step[1]:
                x.append(r'\left( ' + step[0] + r' \right)')
            else:
                x.append(step[0])
        string = s.format(*x)
        result.append((string, p))
    return result


def get_types(*args):
    types = tuple(map(lambda arg: arg.type if isinstance(arg, AvoVariable) else type(arg), args))
    return types[0] if len(types) == 1 else types


class AvoVariable:
    def __init__(self, var_type, val, explanation=(), mod=0, rows=None, cols=None, proj=None):
        self.type, self.val, self.mod, self.rows, self.cols, self.proj = var_type, val, mod, rows, cols, proj
        if len(explanation) != 0 and explanation[-1][0].replace(' ', '') == repr(self).replace(' ', ''):
            explanation = explanation[:-1]
        self.explanation = tuple(explanation) + ((repr(self), 6 if repr(self)[0] == '-' else 8),)

    def reset(self):
        return AvoVariable(self.type, self.val, (), self.mod, self.rows, self.cols, self.proj)

    def set_explanation(self, explanation):
        return AvoVariable(self.type, self.val, explanation, self.mod, self.rows, self.cols, self.proj)

    #: Basic Boolean Operations

    def __or__(self, other):
        types = get_types(self, other)
        explanation = steps(r'{0}\text{{ or }}{1}', 0, [self, other], [0, 0])
        if types == (BOOLEAN, BOOLEAN):
            return boolean(self.val or other.val, explanation)
        return error(undefined, explanation)

    def __and__(self, other):
        types = get_types(self, other)
        explanation = steps(r'{0}\text{{ and }}{1}', 1, [self, other], [1, 1])
        if types == (BOOLEAN, BOOLEAN):
            return boolean(self.val and other.val, explanation)
        return error(undefined, explanation)

    def __invert__(self):
        types = get_types(self)
        explanation = steps(r'\text{{not }}{0}', 2, [self], [2])
        if types == BOOLEAN:
            return boolean(not self.val, explanation)
        return error(undefined, explanation)

    #: Basic Operations

    def __neg__(self):
        types = get_types(self)
        explanation = steps(r'- {0}', 5, [self], [5])
        if types == NUMBER:
            return number(-self.val, self.mod, explanation)
        elif types == MATRIX:
            return matrix(map(lambda r: map(lambda c: -c, r), self.val), self.mod, explanation)
        return error(undefined, explanation)

    def __add__(self, other):
        types = get_types(self, other)
        explanation = steps(r'{0} + {1}', 4, [self, other], [4, 4])
        if self.mod != other.mod:
            return error('undefined: number base mismatch', explanation)
        elif types == (NUMBER, NUMBER):
            return number(self.val + other.val, self.mod, explanation)
        elif types == (MATRIX, MATRIX) and self.rows == other.rows and self.cols == other.cols:
            return matrix(Matrix(self.val) + Matrix(other.val), self.mod, explanation)
        elif types == (MATRIX, BASIS):
            return vector_free_vars(self, other, explanation)
        elif types == (BASIS, BASIS):
            return basis(self.val + other.val, self.rows, self.mod, explanation)
        return error(undefined, explanation)

    def __sub__(self, other):
        types = get_types(self, other)
        explanation = steps(r'{0} - {1}', 4, [self, other], [4, 5])
        if self.mod != other.mod:
            return error('undefined: number base mismatch', explanation)
        elif types == (NUMBER, NUMBER):
            return number(self.val - other.val, self.mod, explanation)
        elif types == (MATRIX, MATRIX) and self.rows == other.rows and self.cols == other.cols:
            return matrix(Matrix(self.val) - Matrix(other.val), self.mod, explanation)
        return error(undefined, explanation)

    def __mul__(self, other):
        types = get_types(self, other)
        explanation = steps(r'{0} * {1}', 5, [self, other], [5, 5])
        if self.mod != other.mod:
            return error('undefined: number base mismatch', explanation)
        elif types == (NUMBER, NUMBER):
            return number(self.val * other.val, self.mod, explanation)
        elif types == (NUMBER, MATRIX):
            return matrix(map(lambda r: map(lambda c: self * c, r), other.val), self.mod, explanation)
        elif types == (MATRIX, NUMBER):
            return matrix(map(lambda r: map(lambda c: other * c, r), self.val), self.mod, explanation)
        elif types == (MATRIX, MATRIX) and self.cols == other.rows:
            return matrix(Matrix(self.val) * Matrix(other.val), self.mod, explanation)
        return error(undefined, explanation)

    def __truediv__(self, other):
        types = get_types(self, other)
        explanation = steps(r'\frac{{{0}}}{{{1}}}', 6, [self, other], [0, 0])
        if self.mod != other.mod:
            return error('undefined: number base mismatch', explanation)
        elif other == 0:
            return error("Zero division error", explanation)
        elif types == (NUMBER, NUMBER):
            if self.mod == 0:
                return number(self.val / other.val, self.mod, explanation)
            elif other == int(other):
                inv = inverse(int(other), self.mod)
                return number(self.val * inv, self.mod, explanation)
        elif types == (MATRIX, NUMBER):
            return matrix(tuple(map(lambda row: map(lambda cell: cell / other, row), self.val)), self.mod, explanation)
        return error(undefined, explanation)

    def __mod__(self, other):
        types = get_types(self, other)
        explanation = steps(r'{0}\text{{ mod }}{1}', 5, [self, other], [5, 6])
        if types[1] != NUMBER or other != int(other):
            return error(undefined, explanation)
        elif types[0] == NUMBER:
            return number(self.val, int(other), explanation)
        elif types[0] == MATRIX:
            return matrix(self.val, int(other), self.explanation)
        return error(undefined, explanation)

    def __pow__(self, other):
        types = get_types(self, other)
        explanation = steps(r'{0}^{{{1}}}', 6, [self, other], [8, 0])
        if types == (NUMBER, NUMBER):
            if self.mod == 0:
                return number(self.val ** other.val, self.mod, explanation)
            elif other == int(other):
                other = int(other)
                if other >= 0:
                    return number(self.val ** int(other), self.mod, explanation)
                else:
                    return number(inverse(self.val, self.mod) ** -int(other), self.mod, explanation)
        elif types == (MATRIX, NUMBER) and self.rows == self.cols and other == int(other):
            o = int(other)
            s = self if o >= 0 else self.inverse()
            if s.type == MATRIX:
                return matrix(Matrix(s.val) ** abs(o), self.mod, explanation)
        return error(undefined, explanation)

    #: Basic Comparisons

    def __eq__(self, other):
        types = get_types(self, other)
        explanation = steps(r'{0} = {1}', 3, [self, other], [4, 4])
        if types == (BOOLEAN, bool):
            return boolean(self.val == other, explanation)
        elif types in ((NUMBER, int), (NUMBER, float)):
            return boolean(abs(self.val - other) < 0.001, explanation)
        elif types == (NUMBER, NUMBER):
            return boolean(abs(self.val - other.val) < 0.001, explanation)
        elif types == (MATRIX, list) and isinstance(other[0], (int, float)) and self.is_v():
            return boolean(all(map(lambda x, y: x[0] == y, self.val, other)), explanation)
        elif types == (MATRIX, list):
            return boolean(self.val == other, explanation)
        elif types == (MATRIX, int) and other == 0:
            return boolean(all(map(lambda r: all(map(lambda c: c == 0, r)), self.val)), explanation)
        elif types == (BASIS, int) and other == 0:
            return boolean(len(self.val) == 0, explanation)
        elif types in ((BOOLEAN, BOOLEAN), (MATRIX, MATRIX)):
            return boolean(self.val == other.val, explanation)
        elif types == (BASIS, BASIS) and self.mod == 0 and other.mod == 0:
            return boolean(bool(self.proj == other.proj), explanation)
        elif types == (BASIS, BASIS) and self.mod == other.mod:
            return boolean(self.cols == (self+other).cols, explanation)
        elif types == (VECTOR_FREE_VARS, VECTOR_FREE_VARS):
            return (self.rows == other.rows and (self.val[0] - other.val[0]).in_span(self.val[1])
                    and self.val[1] == other.val[1]).set_explanation(explanation)
        elif types == (POLYNOMIAL, POLYNOMIAL):
            return boolean(self.val == other.val and self.mod == other.mod, explanation)
        return error(undefined, explanation)

    def __ne__(self, other):
        explanation = steps(r'{0} \neq {1}', 3, [self, other], [4, 4])
        return (self.__eq__(other).__invert__()).set_explanation(explanation)

    def __gt__(self, other):
        explanation = steps(r'{0} > {1}', 3, [self, other], [4, 4])
        if self.type == NUMBER and other.type == NUMBER:
            return boolean(self.val > other.val, explanation)
        return error(undefined, explanation)

    def __lt__(self, other):
        explanation = steps(r'{0} < {1}', 3, [self, other], [4, 4])
        if self.type == NUMBER and other.type == NUMBER:
            return boolean(self.val < other.val, explanation)
        return error(undefined, explanation)

    def __ge__(self, other):
        explanation = steps(r'{0} \ge {1}', 3, [self, other], [4, 4])
        if self.type == NUMBER and other.type == NUMBER:
            return boolean(self.val >= other.val, explanation)
        return error(undefined, explanation)

    def __le__(self, other):
        explanation = steps(r'{0} \le {1}', 3, [self, other], [4, 4])
        if self.type == NUMBER and other.type == NUMBER:
            return boolean(self.val <= other.val, explanation)
        return error(undefined, explanation)

    #: Number Operations

    def sqrt(self):
        explanation = steps(r'\sqrt{{{0}}}', 8, [self], [0])
        if get_types(self) == NUMBER and self.mod == 0 and self.val >= 0:
            return number(sqrt(self.val), 0, explanation)
        return error(undefined, explanation)

    def sin(self):
        explanation = steps(r'\text{{sin}}\left( {0} \right)', 8, [self], [0])
        if get_types(self) == NUMBER and self.mod == 0:
            return number(sin(self.val * pi / 180), 0, explanation)
        return error(undefined, explanation)

    def cos(self):
        explanation = steps(r'\text{{cos}}\left( {0} \right)', 8, [self], [0])
        if get_types(self) == NUMBER and self.mod == 0:
            return number(cos(self.val * pi / 180), 0, explanation)
        return error(undefined, explanation)

    def tan(self):
        explanation = steps(r'\text{{tan}}\left( {0} \right)', 8, [self], [0])
        if get_types(self) == NUMBER and self.mod == 0 and abs((self.val / 180) % 1 - 0.5) > 0.001:
            return number(tan(self.val * pi / 180), 0, explanation)
        return error(undefined, explanation)

    def arcsin(self):
        explanation = steps(r'\text{{arcsin}}\left( {0} \right)', 8, [self], [0])
        if get_types(self) == NUMBER and self.mod == 0 and -1 <= self.val <= 1:
            return number(asin(self.val) * 180 / pi, 0, explanation)
        return error(undefined, explanation)

    def arccos(self):
        explanation = steps(r'\text{{arccos}}\left( {0} \right)', 8, [self], [0])
        if get_types(self) == NUMBER and self.mod == 0 and -1 <= self.val <= 1:
            return number(acos(self.val) * 180 / pi, 0, explanation)
        return error(undefined, explanation)

    def arctan(self):
        explanation = steps(r'\text{{arctan}}\left( {0} \right)', 8, [self], [0])
        if get_types(self) == NUMBER and self.mod == 0:
            return number(atan(self.val) * 180 / pi, 0, explanation)
        return error(undefined, explanation)

    def rotation(self):
        explanation = steps(r'\text{{Rot}}\left( {0} \right)', 8, [self], [0])
        if self.type == NUMBER and self.mod == 0:
            return matrix([[self.cos(), -self.sin()], [self.sin(), self.cos()]], 0, explanation)
        return error(undefined, explanation)

    def reflection(self):
        explanation = steps(r'\text{{Ref}}\left( {0} \right)', 8, [self], [0])
        if self.type == NUMBER and self.mod == 0:
            s = number(2) * self
            return matrix([[s.cos(), s.sin()], [s.sin(), -s.cos()]], 0, explanation)
        return error(undefined, explanation)

    def ln(self):
        explanation = steps(r'\text{{ln}}\left( {0} \right)', 8, [self], [0])
        if get_types(self) == NUMBER and self.mod == 0 and 0 < self.val:
            return number(log(self.val), 0, explanation)
        return error(undefined, explanation)

    #: Vector Operations

    def is_v(self):
        return boolean(self.type == MATRIX and self.cols == 1, steps(r'{0}\text{{ is vector}}', 3, [self], [4]))

    def dot(self, other):
        explanation = steps(r'{0} \cdot {1}', 5, [self, other], [6, 6])
        if self.mod != other.mod:
            return error('undefined: number base mismatch', explanation)
        elif self.is_v() and other.is_v() and self.rows == other.rows:
            result = Matrix(self.val).dot(Matrix(other.val))
            return number(float(result), self.mod, explanation)
        return error(undefined, explanation)

    def cross(self, other):
        # Todo - not sure if modulo should be supported for this operation
        explanation = steps(r'{0} \times {1}', 5, [self, other], [6, 6])
        if self.mod != other.mod:
            return error('undefined: number base mismatch', explanation)
        elif self.is_v() and other.is_v() and self.rows == other.rows == 3:
            return matrix(Matrix(self.val).cross(Matrix(other.val)), self.mod, explanation)
        return error(undefined, explanation)

    def norm(self):
        explanation = steps(r'\text{{norm}}\left( {0} \right)', 8, [self], [0])
        if self.is_v() and self.mod == 0:
            return number(float(Matrix(self.val).norm()), 0, explanation)
        return error(undefined, explanation)

    def angle(self, other):
        explanation = steps(r'\text{{angle}}\left( {0} , {1} \right)', 8, [self, other], [0, 0])
        if self.is_v() and other.is_v() and self.rows == other.rows and self.mod == other.mod == 0:
            return number(float((self.dot(other) / self.norm() / other.norm()).arccos()), 0, explanation)
        return error(undefined, explanation)

    def projection(self, other):
        explanation = steps(r'\text{{proj}}_{{{0}}} \left( {1} \right)', 8, [self, other], [0, 0])
        if self.mod != 0 or other.mod != 0:
            return error('undefined: can\'t project in \(\mathbb{Z}\) space', explanation)
        elif self.is_v() and other.is_v() and self.rows == other.rows:
            return matrix(Matrix(other.val).project(Matrix(self.val)), 0, explanation)
        elif self.type == BASIS and self.mod == 0 and other.is_v() and other.mod == 0:
            return (self.proj * other).set_explanation(explanation)
        return error(undefined, explanation)

    #: Matrix Operations

    def get(self, row, column):
        types = get_types(self, row, column)
        if types == (MATRIX, NUMBER, NUMBER):
            r, c = int(row) - 1, int(column) - 1
            if not (-1 <= r < self.rows and -1 <= c < self.cols):
                return error(undefined,
                             steps(r'\text{{get}}\left( {0} , {1} , {2} \right)', 8, [self, row, column], [0, 0, 0]))
            explanation = list(self.explanation)
            if r == -1:
                explanation[-1] = r'\begin{bmatrix}' + r'\\'.join(map(lambda y: ('&'.join(map(
                    lambda x: str(self.val[y][x]) if x != c else
                    r'\color{red}{' + str(self.val[y][x]) + '}', range(self.cols)))),
                                                                      range(self.rows))) + r'\end{bmatrix}', 8
                return matrix(list(map(lambda x: [x[c]], self.val)), self.mod, explanation)
            elif c == -1:
                explanation[-1] = r'\begin{bmatrix}' + r'\\'.join(map(lambda y: ('&'.join(map(
                    lambda x: str(self.val[y][x]) if y != r else
                    r'\color{red}{' + str(self.val[y][x]) + '}', range(self.cols)))),
                                                                      range(self.rows))) + r'\end{bmatrix}', 8
                return matrix(list(map(lambda x: [x], self.val[r])), self.mod, explanation)
            else:
                explanation[-1] = r'\begin{bmatrix}' + r'\\'.join(map(lambda y: ('&'.join(map(
                    lambda x: str(self.val[y][x]) if x != c or y != r else
                    r'\color{red}{' + str(self.val[y][x]) + '}', range(self.cols)))),
                                                                      range(self.rows))) + r'\end{bmatrix}', 8
                return number(float(self.val[r][c]), self.mod, explanation)
        return error(undefined, steps(r'\text{{get}}\left( {0} , {1} , {2} \right)', 8, [self, row, column], [0, 0, 0]))

    def set(self, row, column, value):
        types = get_types(self, row, column)
        if types == (MATRIX, NUMBER, NUMBER):
            r, c = int(row) - 1, int(column) - 1
            if not (-1 <= r < self.rows and -1 <= c < self.cols):
                return error(undefined, steps(
                    r'\text{{set}}\left( {0} , {1} , {2}, {3} \right)', 8, [self, row, column], [0, 0, 0]))
            explanation = list(self.explanation)
            if r == -1 and 0 <= c < self.cols and value.is_v() and value.rows == self.rows:
                explanation[-1] = r'\begin{bmatrix}' + r'\\'.join(map(lambda y: '&'.join(map(
                    lambda x: str(self.val[y][x]) if x != c else
                    r'\color{green}{' + str(value.val[y][0]) + '}', range(self.cols))),
                                                                      range(self.rows))) + r'\end{bmatrix}', 8
                result = map(lambda y: map(lambda x: self.val[y][x] if x != c else value.val[y][0],
                                           range(self.cols)), range(self.rows))
                return matrix(result, self.mod, explanation)
            elif c == -1 and 0 <= r < self.rows and value.is_v() and value.rows == self.cols:
                explanation[-1] = r'\begin{bmatrix}' + r'\\'.join(map(lambda y: '&'.join(map(
                    lambda x: str(self.val[y][x]) if y != r else
                    r'\color{green}{' + str(value.val[x][0]) + '}', range(self.cols))),
                                                                      range(self.rows))) + r'\end{bmatrix}', 8
                result = map(lambda y: map(lambda x: self.val[y][x] if y != r else value.val[x][0],
                                           range(self.cols)), range(self.rows))
                return matrix(result, self.mod, explanation)
            elif 0 <= r < self.rows and 0 <= c < self.cols and value.type == NUMBER:
                explanation[-1] = r'\begin{bmatrix}' + r'\\'.join(map(lambda y: '&'.join(map(
                    lambda x: str(self.val[y][x]) if x != c or y != r else
                    r'\color{green}{' + str(value) + '}', range(self.cols))), range(self.rows))) + r'\end{bmatrix}', 8
                result = map(lambda y: map(lambda x: self.val[y][x] if x != c or y != r else value,
                                           range(self.cols)), range(self.rows))
                return matrix(result, self.mod, explanation)
        explanation = r'\text{{set}}\left( {0} , {1} , {2} , {3} \right)'
        return error(undefined, steps(explanation, 8, [self, row, column, value], [0, 0, 0, 0]))

    def adjugate(self):
        explanation = steps(r'\text{{adjugate}}\left( {0} \right)', 8, [self], [0])
        if self.type == MATRIX and self.rows == self.cols:
            return matrix(Matrix(self.val).adjugate(), self.mod, explanation)
        return error(undefined, explanation)

    def det(self):
        explanation = steps(r'\text{{det}}\left( {0} \right)', 8, [self], [0])
        if self.type == MATRIX and self.rows == self.cols:
            return number(float(Matrix(self.val).det()), self.mod, explanation)
        return error(undefined, explanation)

    def inverse(self):
        explanation = steps(r'{0}^{{-1}}', 6, [self], [8])
        if self.type == MATRIX and self.rows == self.cols and self.det() != 0:
            return (self.adjugate() / self.det()).set_explanation(explanation)
        return error(undefined, explanation)

    def rref(self):
        explanation = steps(r'\text{{rref}}\left( {0} \right)', 8, [self], [0])
        if self.type == MATRIX:
            result = matrix(self.val, self.mod)
            x, y = 0, 0
            while y < self.rows and x < self.cols:
                z = y + 1
                while z < self.rows and result.val[y][x] == 0:
                    if result.val[z][x] != 0:
                        result.val[y], result.val[z] = result.val[z], result.val[y]
                    else:
                        z += 1
                if result.val[y][x] != 0:
                    if result.val[y][x] != 1:
                        result.val[y] = list(map(lambda c: c / result.val[y][x], result.val[y]))
                    for z in range(self.rows):
                        if z != y and result.val[z][x] != 0:
                            result.val[z] = list(map(lambda c: result.val[z][c] - result.val[z][x]
                                                     * result.val[y][c], range(self.cols)))
                    y += 1
                x += 1
            return matrix(result.val, self.mod, explanation)
        return error(undefined, explanation)

    def scalar_of(self, other):
        types = get_types(self, other)
        explanation = steps(r'c * {0} = {1}', 3, [self, other], [5, 4])
        if types == (MATRIX, MATRIX) and self.rows == other.rows and self.cols == other.cols:
            scalar = None
            for y in range(self.rows):
                for x in range(self.cols):
                    if self.val[y][x] != 0:
                        new_scalar = other.val[y][x] / self.val[y][x]
                        if scalar is None:
                            scalar = new_scalar
                        elif scalar != new_scalar:
                            return boolean(False, explanation)
                    elif other.val[y][x] != 0:
                        return boolean(False, explanation)
            return boolean(True, explanation)
        return boolean(False, explanation)

    def similar_to(self, other):
        types = get_types(self, other)
        explanation = steps(r'{0} \sim {1}', 3, [self, other], [4, 4])
        if types == (MATRIX, MATRIX) and self.rows == self.cols == other.rows == other.cols and self.mod == other.mod:
            if self.mod == 0:
                e1 = Matrix(self.val).eigenvals()
                e2 = Matrix(other.val).eigenvals()
                if e1 != e2 or sum(e1.values()) != self.rows:
                    return boolean(False, explanation)
                for e, m in e1.items():
                    k, g = 0, 0
                    while g < m:
                        k += 1
                        g = matrix(Matrix(self.val) - Matrix.eye(self.rows) * e).null_space().cols
                        if g != matrix(Matrix(other.val) - Matrix.eye(self.rows) * e).null_space().cols:
                            return boolean(False, explanation)
                return boolean(True, explanation)
            else:
                raise NotImplementedError  # Todo
        return boolean(False, explanation)

    def transpose(self):
        explanation = steps(r'{0}^T', 6, [self], [8])
        if self.type == MATRIX:
            return matrix(Matrix(self.val).T, self.mod, explanation)
        return error(undefined, explanation)

    def row_space(self):
        explanation = steps(r'\text{{row}}\left( {0} \right)', 8, [self], [0])
        if self.type == MATRIX:
            return basis(map(lambda r: self.get(number(r + 1), number(0)), range(self.rows)),
                         self.cols, self.mod, explanation)
        return error(undefined, explanation)

    def column_space(self):
        explanation = steps(r'\text{{col}}\left( {0} \right)', 8, [self], [0])
        if self.type == MATRIX:
            return basis(map(lambda c: self.get(number(0), number(c + 1)), range(self.cols)),
                         self.rows, self.mod, explanation)
        return error(undefined, explanation)

    def null_space(self):
        explanation = steps(r'\text{{null}}\left( {0} \right)', 8, [self], [0])
        if self.type == MATRIX:
            result = []
            rref = self.rref()
            free_columns = list(range(self.cols))
            for i in range(self.rows):
                for j in range(self.cols):
                    if rref.val[i][j] == 1:
                        free_columns.remove(j)
                        break
            for index in free_columns:
                vector = list(map(lambda x: 1 if x == index else 0, range(self.cols)))
                for i in range(self.rows):
                    for j in range(self.cols):
                        if rref.val[i][j] == 1:
                            vector[j] = -rref.val[i][index]
                            break
                result.append(matrix(map(lambda x: [x], vector), self.mod, ()))
            return basis(result, self.cols, self.mod, explanation)
        return error(undefined, explanation)

    def eigenspaces(self):
        explanation = steps(r'\text{{eigenspaces}}\left( {0} \right)', 8, [self], [0])
        if self.type == MATRIX and self.rows == self.cols:
            values = tuple(map(lambda x: number(float(x)), Matrix(self.val).eigenvals().keys()))
            spaces = tuple(map(lambda x: (self - AvoVariable.identity(self.rows) * x).null_space(), values))
            return values + spaces
        return error(undefined, explanation)

    def diagonal(self):
        explanation = steps(r'\text{{diagonal}}\left( {0} \right)', 8, [self], [0])
        if get_types(self) == MATRIX and self.is_v():
            return matrix(Matrix.diag(list(map(lambda x: float(x[0]), self.val))), self.mod, explanation)
        return error(undefined, explanation)

    def char_poly(self):
        explanation = steps(r'\text{{charPoly}}\left( {0} \right)', 8, [self], [0])
        if get_types(self) == MATRIX and self.rows == self.cols:
            coeffs = Matrix(self.val).charpoly().all_coeffs()
            coeffs.reverse()
            return polynomial(coeffs, self.mod)
        return error(undefined, explanation)

    def identity(self):
        if get_types(self) in (NUMBER, int):
            return matrix(map(lambda y: map(lambda x: 1 if x == y else 0, range(int(self))), range(int(self))))
        return error(undefined)

    def rank(self):
        explanation = steps(r'\text{{rank}}\left( {0} \right)', 8, [self], [0])
        if get_types(self) == MATRIX:
            return number(self.row_space().cols, 0, explanation)
        return error(undefined, explanation)

    #: Basis Operations

    def contains(self, other):
        types = get_types(self, other)
        explanation = steps(r'{0} \text{{ contains }} {1}', 3, [self, other], [4, 4])
        if types == (BASIS, MATRIX) and other.is_v():
            return boolean(other in self.val, explanation)
        return boolean(False, explanation)

    def in_span(self, other):
        types = get_types(self, other)
        explanation = steps(r'{0}\text{{ in span}}\left({1}\right)', 3, [self, other], [3, 0])
        if types == (MATRIX, BASIS) and self.is_v() and self.rows == other.rows:
            if self.mod == 0:
                # noinspection PyTypeChecker
                return (self == other.proj * self).set_explanation(explanation)
            else:
                return (basis([self], self.rows, self.mod) + other == other).set_explanation(explanation)
        return boolean(False, explanation)

    def is_normal(self):
        explanation = steps(r'\text{{isNormal}}\left( {0} \right)', 8, [self], [0])
        if self.type == BASIS:
            return boolean(all(map(lambda v: v.norm() == 1, self.val)), explanation)
        return error(undefined, explanation)

    def is_orthogonal(self):
        explanation = steps(r'\text{{isOsrthogonal}}\left( {0} \right)', 8, [self], [0])
        if self.type == BASIS:
            for i in range(self.cols):
                for j in range(i + 1, self.cols):
                    if self.val[i].dot(self.val[j]) != 0:
                        return boolean(False, explanation)
            return boolean(True, explanation)
        return error(undefined, explanation)

    def exactly_equal(self, other):
        types = get_types(self, other)
        explanation = steps(r'{0} \text{{ exactly equal to }} {1}', 3, [self, other], [4, 4])
        if types == (BASIS, BASIS):
            return boolean(self.val == other.val, explanation)
        return error(undefined, explanation)

    def gram_schmidt(self):
        explanation = steps(r'\text{{orthogonalize}}\left({0}\right)', 8, [self], [0])
        if self.type == BASIS and self.mod == 0:
            vectors = []
            proj = matrix([[0] * self.rows] * self.rows, self.mod)
            for v in self.val:
                orthogonal = v - proj * v
                if orthogonal != 0:
                    vectors.append(orthogonal)
                    proj += orthogonal * orthogonal.transpose() / orthogonal.dot(orthogonal)
            return basis(vectors, self.rows, 0, explanation)
        return error(undefined, explanation)

    def projection_matrix(self):
        explanation = steps(r'\text{{ProjectionMatrix}}\left( {0} \right)', 8, [self], [0])
        if self.type == BASIS:
            return self.proj.set_explanation(explanation)
        return error(undefined, explanation)

    def normalize(self):
        explanation = steps(r'\text{{normalize}}\left( {0} \right)', 8, [self], [0])
        if self.type == BASIS and self.mod == 0:
            return basis(map(lambda v: v / v.norm(), self.val), self.rows, 0, explanation)
        return error(undefined, explanation)

    def dim(self):
        explanation = steps(r'\text{{dim}}\left( {0} \right)', 8, [self], [0])
        if get_types(self) == BASIS:
            return number(self.cols, 0, explanation)
        return error(undefined, explanation)

    def as_matrix(self):
        explanation = steps(r'\text{{matrix}}\left( {0} \right)', 8, [self], [0])
        if get_types(self) == BASIS:
            return matrix(map(lambda v: map(lambda c: c[0], v.val), self.val), self.mod, explanation)
        return error(undefined, explanation)

    #: Casting to Built-ins

    def __bool__(self):
        if self.type == ERROR:
            return False
        elif self.type == BOOLEAN:
            return self.val
        else:
            raise ValueError(f"Can't cast '{self.string()}' to a boolean")

    def __int__(self):
        if self.type == NUMBER:
            return round(self.val)
        else:
            raise ValueError(f"Can't cast '{self.string()}' to an integer")

    def __float__(self):
        if self.type == NUMBER:
            return float(self.val)
        else:
            raise ValueError(f"Can't cast '{self.string()}' to a floating point number")

    #: String Representations

    def __repr__(self):
        if self.type == ERROR:
            return r"\text{[" + self.val + "]}"
        elif self.type == BOOLEAN:
            return r'\color{green}✔' if self.val else r'\color{red}✘'
        elif self.type == NUMBER and self.mod == 0:
            n = fraction(self.val)
            if n is not None:
                return str(n[0]) if n[1] == 1 else r'\frac{' + str(n[0]) + '}{' + str(n[1]) + '}'
            n = fraction(self.val ** 2)
            if n is not None:
                squares = 1, 4, 9, 16, 25, 36, 49, 64, 81, 100
                prefix = '-' if self.val < 0 else ''
                if n[0] == 0:
                    return "0"
                elif n[1] == 1:
                    return prefix + r'\sqrt{' + str(n[0]) + '}'
                elif n[0] in squares:
                    return prefix + r'\frac{' + str(int(sqrt(n[0]))) + r'}{\sqrt{' + str(n[1]) + '}}'
                elif n[1] in squares:
                    return prefix + r'\frac{\sqrt{' + str(n[0]) + '}}{' + str(int(sqrt(n[1]))) + '}'
                else:
                    return prefix + r'\sqrt{\frac{' + str(n[0]) + '}{' + str(n[1]) + '}}'
            return str(round(self.val, 3))
        elif self.type == NUMBER and self.mod >= 2:
            return str(self.val)
        elif self.type == MATRIX:
            return r'\begin{bmatrix}' + r'\\'.join(map(lambda r: ('&'.join(map(lambda c: repr(c), r))), self.val)) \
                   + r'\end{bmatrix}'
        elif self.type == BASIS:
            return r'\left\{' + ','.join(map(lambda v: str(v), self.val)) + r'\right\}'
        elif self.type == MC_ANS:
            return r'\text{' + self.val[1][self.val[0]] + '}' if self.val[0] is not None else r'\text{No answer}'
        elif self.type == TF_ANS:
            return r'\text{True}' if self.val[0] is True else r'\text{False}' if self.val[0] is False\
                else r'\text{No answer}'
        elif self.type == VECTOR_FREE_VARS:
            # noinspection SpellCheckingInspection
            var_names = 'pqrst'[-self.val[1].cols:]
            result = r'\begin{bmatrix}'
            for y in range(self.rows):
                result += str(self.val[0].val[y][0])
                for x in range(self.val[1].cols):
                    if self.val[1].val[x].val[y][0] != 0:
                        result += '+' + str(self.val[1].val[x].val[y][0]) + var_names[x]
                result += r'\\'
            result = result[:-1] + 'end{bmatrix}'
            return sub(r'0\+', '', sub(r'([+\-])1([a-zA-Z])', r'\1\2', result)).replace('+-', '-')
        elif self.type == POLYNOMIAL:
            terms = []
            for i in range(len(self.val)):
                term = '' if i == 0 else 'x' if i == 1 else f'x^{{{i+1}}}'
                if self.val[i] == 1 and i > 0:
                    terms.append(term)
                elif self.val[i] == -1 and i > 0:
                    terms.append('-' + term)
                else:
                    terms.append(str(self.val[i]) + term)
            terms.reverse()
            return '+'.join(terms).replace('+-', '-')

    def string(self):
        if self.type == ERROR:
            return '[' + self.val + ']'
        elif self.type == BOOLEAN:
            return '✔' if self.val else '✘'
        elif self.type == NUMBER and self.mod == 0:
            n = fraction(self.val)
            if n is not None:
                return str(n[0]) if n[1] == 1 else '(' + str(n[0]) + '/' + str(n[1]) + ')'
            n = fraction(self.val ** 2)
            if n is not None:
                squares = 1, 4, 9, 16, 25, 36, 49, 64, 81, 100
                if n[0] == 0:
                    return "0"
                elif n[1] == 1:
                    return 'sqrt(' + str(n[0]) + ')'
                elif n[0] in squares:
                    return '(' + str(int(sqrt(n[0]))) + '/sqrt(' + str(n[1]) + '))'
                elif n[1] in squares:
                    return '(sqrt(' + str(n[0]) + ')/' + str(int(sqrt(n[1]))) + ')'
                else:
                    return 'sqrt(' + str(n[0]) + '/' + str(n[1]) + ')'
            return str(round(self.val, 3))
        elif self.type == NUMBER and self.mod >= 2:
            return str(self.val)
        elif self.type == MATRIX:
            return '[[' + '], ['.join(map(lambda r: (', '.join(map(lambda c: repr(c), r))), self.val)) + ']]'
        elif self.type == BASIS:
            return '{' + ', '.join(map(lambda v: str(v), self.val)) + '}'

    def system_of_equations(self, other):
        if self.type == MATRIX and (other == 0 or (other.is_v() and self.rows == other.rows)):
            result = "\\begin{matrix}"
            # noinspection SpellCheckingInspection
            var_names = 'xyz' if self.cols <= 3 else 'abcdefghijklmnopqrstuvwxyz'
            for y in range(self.rows):
                for x in range(self.cols):
                    if self.val[y][x] == -1:
                        result += '-' + var_names[x]
                    elif self.val[y][x].val < 0:
                        result += str(self.val[y][x]) + var_names[x]
                    elif result[-1] in ('\\', '}'):
                        if self.val[y][x] == 0:
                            pass
                        elif self.val[y][x] == 1:
                            result += var_names[x]
                        else:
                            result += repr(self.val[y][x]) + var_names[x]
                    else:
                        if self.val[y][x] == 0:
                            pass
                        elif self.val[y][x] == 1:
                            result += '+' + var_names[x]
                        else:
                            result += '+' + repr(self.val[y][x]) + var_names[x]
                if other == 0:
                    result += r'=0\\'
                else:
                    result += '=' + str(other.val[y][0]) + r'\\'
            return result[:-1] + "end{matrix}"
        return r'\text{Invalid argument}'

    def highlight_pivots(self):
        if self.type == MATRIX:
            result = "\\begin{bmatrix}"
            for y in range(self.rows):
                pivot = True
                for x in range(self.cols):
                    if pivot:
                        if self.val[y][x] != 0:
                            result += r'\color{red}{' + repr(self.val[y][x]) + "}&"
                            pivot = False
                        else:
                            result += r'\color{#999999}{' + repr(self.val[y][x]) + "}&"
                    else:
                        result += repr(self.val[y][x]) + "&"
                result = result[:-1] + r"\\"
            return result[:-1] + "end{bmatrix}"
        return r'\text{Only matrices can have their pivots highlighted}'

    def vector_free_vars(self, other):
        types = get_types(self, other)
        if types == (MATRIX, BASIS):
            if not self.is_v() or self.rows != other.rows:
                return r'\text{Invalid dimensions of matrix/basis}'
            result = r'\begin{bmatrix}'
            for y in range(self.rows):
                result += str(self.val[y][0])
                for x in range(other.cols):
                    if other.val[x].val[y][0] != 0:
                        result += '+' + str(other.val[x].val[y][0]) + 'st'[x]
                result += r'\\'
            result = result[:-1] + 'end{bmatrix}'
            return sub(r'0\+', '', sub(r'([+\-])1([a-zA-Z])', r'\1\2', result)).replace('+-', '-')
        return r'\text{Invalid types for vector/basis string}'

    def vector_as_point(self):
        if self.is_v():
            return r'\left(' + ', '.join(map(lambda row: str(row[0]), self.val)) + r'\right)'
        return r'\text{Only vectors can be represented as points}'

    def augment(self, other):
        types = get_types(self, other)
        if types == (MATRIX, MATRIX):
            if self.rows != other.rows:
                return r'\text{Invalid dimensions for augmented matrix}'
            return r'\left[\begin{array}{' + 'r' * self.cols + '|' + 'r' * other.cols + '}'\
                   + r'\\'.join(map(lambda x, y: '&'.join(map(lambda cell: repr(cell), (x + y))), self.val, other.val))\
                   + r'\end{array}\right]'
        return r'\text{Invalid types for matrix/vector string}'

    #: Marking Functions

    def multiple_choice(self, other):
        types = get_types(self, other)
        if types != (MC_ANS, NUMBER):
            return error(undefined)
        explanation = [self.val[1][0]] if len(self.val[1][0]) > 0 else []
        explanation.append('Correct answer: ' + self.val[1][int(other)])
        explanation = [(r'\(\\\)'.join(explanation), -1)]
        return boolean(self.val[0] == int(other), explanation)

    def true_false(self, other):
        types = get_types(self, other)
        if types != (TF_ANS, BOOLEAN):
            return error(undefined)

        explanation = [self.val[1]] \
            if len(self.val[1]) > 0 \
            else []  # indexing error that would only be a problem if a true/false answer field had no prompt.

        explanation.append('Correct answer: ' + ('True' if other.val else 'False'))
        explanation = [(r'\(\\\)'.join(explanation), -1)]
        return boolean(self.val[0] == other.val, explanation)


########################################################################################################################


class AvoRandom:
    SEED_SIZE = 65537
    FACTOR = 7481
    RANK_3 = '001233434002344434004124234004234344011112343011223232011334343012122334012122343012123233' \
             '012224233012233343012334343013114344013123444014124444023234444112123234112233323112344434' \
             '114234344122223343124234444124234446223234433233334343233334464234344446234344464334343436'

    def __init__(self, seed=0):
        seed = int(seed)
        if not 0 <= seed < AvoRandom.SEED_SIZE - 1:
            raise ValueError
        self.seed = seed + 1

    def _next(self, bound):
        bound = int(bound)
        if bound == 1:
            return 0
        if not 0 < bound < AvoRandom.SEED_SIZE:
            raise ValueError
        self.seed = self.seed * AvoRandom.FACTOR % AvoRandom.SEED_SIZE
        return self.seed % bound

    def _validate(self, given, bound):
        given, bound = int(given), int(bound)
        if given == -1:
            return self._next(bound)
        elif not 0 <= given < bound:
            return given % bound
        else:
            return given

    def scramble(self, array: list, rows: int, cols: int, negative: int, transpose: int) -> tuple:
        dim = len(array)

        rows = self._validate(rows, factorial(dim))
        for y in range(dim - 1):
            row = rows % (dim - y)
            rows //= dim - y
            array.append(array.pop(row))

        cols = self._validate(cols, factorial(dim))
        for x in range(dim - 1):
            col = cols % (dim - x)
            cols //= dim - x
            for y in range(dim):
                array[y].append(array[y].pop(col))

        negative = self._validate(negative, 4 ** dim)
        for y in range(dim):
            row = negative % 2
            negative //= 2
            col = negative % 2
            negative //= 2
            for x in range(dim):
                if row:
                    array[y][x] *= -1
                if col:
                    array[x][y] *= -1

        if transpose:
            array = tuple(map(lambda c: tuple(map(lambda r: array[r][c], range(dim))), range(dim)))

        return array

    #: Random Generation Methods

    def boolean(self):
        """
        Generates a random boolean
        :return: Random boolean
        """
        return boolean(self._next(2) == 1)

    def number(self, lower, upper, zeroes_mod):
        """
        Generates a random number
        :param lower: Minimum value (inclusive)
        :param upper: Maximum value (inclusive)
        :param zeroes_mod: 2+ for a modulo number, 0 for a random number, 1 for a nonzero random number
        :return: Random number
        """
        if get_types(lower, upper, zeroes_mod) not in ((NUMBER, NUMBER, NUMBER), (int, int, int)):
            return error(undefined)
        lower, upper, zeroes_mod = int(lower), int(upper), int(zeroes_mod)
        if lower > upper or zeroes_mod == 1 and (lower == 0 or upper == 0):
            return error(undefined)
        if lower < 0 < upper and zeroes_mod == 1:
            value = lower + self._next(upper - lower)
            value = value if value < 0 else value + 1
        else:
            value = lower + self._next(upper - lower + 1)
        return number(value, zeroes_mod)

    def matrix(self, lower, upper, zeroes_mod, rows, cols):
        """
        Generates a random matrix with no special properties
        :param lower: Minimum value (inclusive)
        :param upper: Maximum value (inclusive)
        :param zeroes_mod: 2+ for a modulo number, 0 for a random number, 1 for a nonzero random number
        :param rows: The number of rows in the matrix
        :param cols: The number of columns in the matrix
        :return: Random matrix
        """
        if get_types(lower, upper, zeroes_mod, rows, cols) not in \
                ((NUMBER, NUMBER, NUMBER, NUMBER, NUMBER), (int, int, int, int, int)):
            return error(undefined)
        lower, upper, zeroes_mod, rows, cols = int(lower), int(upper), int(zeroes_mod), int(rows), int(cols)
        result = map(lambda y: map(lambda x: self.number(lower, upper, zeroes_mod), range(cols)), range(rows))
        return matrix(result, zeroes_mod)

    def code_vector(self, check_vector):
        """
        Returns a random valid code vector with no zeroes
        :param check_vector: The check vector for the code being generated
        :return: Random code vector
        """
        if not check_vector.is_v() or check_vector.mod == 0\
                or check_vector.val[-1][0] != 1 or any(map(lambda r: r[0] == 0, check_vector.val)):
            return error(undefined)
        mod = check_vector.mod
        length = check_vector.rows
        result = self.matrix(1, mod - 1, mod, length, 1)
        while result.dot(check_vector) == result.val[-1][0]:
            result = self.matrix(1, mod - 1, mod, length, 1)
        result.val[-1][0] -= result.dot(check_vector)
        return result.reset()

    def matrix_rank(self, dimension, rank, seed, row, column, negative, transpose):
        """
        Generates a random matrix with a specified rank. There will be no zeroes in the matrix, and no row will be a
        multiple of another row unless the rank is 1.
        :param dimension: The dimension of the vector space
        :param rank: The rank of the matrix
        :param seed: The ID of the matrix
        :param row: The order of the rows
        :param column: The order of the columns
        :param negative: Binary representation of which rows and columns to multiply by -1
        :param transpose: 1 to transpose the matrix, 0 otherwise
        :return: Random matrix with given rank
        """
        if get_types(dimension, rank, seed, row, column, negative, transpose) != \
                (NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER):
            return error(undefined)
        dimension, rank, seed, row, column, negative, transpose = \
            int(dimension), int(rank), int(seed), int(row), int(column), int(negative), int(transpose)
        rank = self._validate(rank - 1, dimension) + 1
        if dimension == 2:
            if rank == 1:
                numbers = [1, 2, 3, 4, 5]
                a, b = numbers.pop(self._next(5)), numbers.pop(self._next(4))
                return matrix([[a, -b], [-a, b]])
            elif rank == 2:
                seed = 4 * self._validate(seed, 10)
                array = list(map(lambda x: int(x), '1112112311342132114512252153324323354354'[seed: seed + 4]))
                array = [array[0:2], array[2:4]]
            else:
                return error("Invalid rank for 2x2")
        elif dimension == 3:
            if rank == 1:
                numbers = [1, 2, 3, 4, 5]
                a, b, c = numbers.pop(self._next(5)), numbers.pop(self._next(4)), numbers.pop(self._next(3))
                return matrix([[a, -b, c], [-a, b, -c], [a, -b, c]])
            elif rank == 2:
                seed = 9 * self._validate(seed, 51)
                result_string = '002123244002123486002142324003123243003123483004124173004180344011334419012024234' \
                                '012024333012048234012048333012113473012123234012123333012123432012210444012214233' \
                                '012222234012224317012233492012234321012234420012321333012333420012334391013042224' \
                                '013047223013114316013114417013123233013123327013124137013191344013217233013223379' \
                                '013224282014078224022113243022123224022123482024111234112123134112123167112131324' \
                                '112194233113124312113124389113179323114123132114123141'[seed: seed + 9]
            elif rank == 3:
                seed = 9 * self._validate(seed, 30)
                result_string = AvoRandom.RANK_3[seed: seed + 9]
            else:
                return error("Invalid rank for 3x3")
            array = list(map(lambda x: int(x) - 5, result_string))
            array = [array[0:3], array[3:6], array[6:9]]
        else:
            return error("Unsupported dimension")
        return matrix(self.scramble(array, row, column, negative, transpose))

    def matrix_eigenvector(self, dimension, seed, rows):
        """
        Randomly generates a matrix with eigenvalues and eigenvectors that only contain small integers
        :param dimension: The dimension of the vector space
        :param seed: The ID of the matrix
        :param rows: The order of the rows and columns
        :return: Random matrix with small eigenvectors/eigenvalues
        """
        if get_types(dimension, seed, rows) == (NUMBER, NUMBER, NUMBER):
            dimension, seed, rows = int(dimension), int(seed), int(rows)
            if dimension == 2:
                seed = 4 * self._validate(seed, 42)
                result_string = '614647743663074306331441734874382763636917447678214229622332163424422343' \
                                '243364791672677626738349843977682662414404731364833867491342143203636639' \
                                '876916611474344386791762'[seed: seed + 4]
                array = list(map(lambda x: int(x) - 5, result_string))
                rows = self._validate(rows, 2)
                array = self.scramble([array[0:2], array[2:4]], rows, rows, 0, False)
            elif dimension == 3:
                seed = 9 * self._validate(seed, 32)
                result_string = '872812860872812682016082062017071170871812870018072261870270260870072062026017602' \
                                '026082261862802871862801861026170260027081162027081270861280261028018062860801681' \
                                '821802061821761602821620061820810062820802271820802082820681621820670610820620160' \
                                '820612260820267207810802062810702270810621270'[seed: seed + 9]
                array = list(map(lambda x: int(x) - 4, result_string))

                rows = self._validate(rows, 6)
                array = self.scramble([array[0:3], array[3:6], array[6:9]], rows, rows, 0, False)
            else:
                return error("Unsupported dimension")
            return matrix(array)
        return error(undefined)

    def matrix_rank_mod5(self, dimension, rank, seed, row, column, transpose):
        """
        Generates a random matrix in Z5 with a given rank
        :param dimension: The dimension of the vector space
        :param rank: The rank of the matrix
        :param seed: The ID of the matrix
        :param row: The order of the rows
        :param column: The order of the columns
        :param transpose: 1 to transpose the matrix, 0 otherwise
        :return: Random matrix in Z5 with given rank
        """
        if get_types(dimension, rank, seed, row, column, transpose) != (NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER):
            return error(undefined)
        dimension, rank, seed, row, column, transpose = \
            int(dimension), int(rank), int(seed), int(row), int(column), int(transpose)
        if rank == 1:
            seed = 9 * self._validate(seed, 4)
            result_string = '123241314123241432123314432124243431'[seed: seed + 9]
        elif rank == 2:
            seed = 9 * self._validate(seed, 32)
            result_string = '123213342123214341123214432123231314123231324123231412123231432123234413123234432' \
                            '123241324123241412123241413123241423123243431123243432123314341123314342123314431' \
                            '123324432123341423123341432123342432123423432124241432124243432124324431124341423' \
                            '124342431124423431134341423134342423134342432'[seed: seed + 9]
        elif rank == 3:
            seed = 9 * self._validate(seed, 50)
            result_string = '123213341123214342123214431123231312123231342123231413123231423123234341123234342' \
                            '123234412123234421123234423123234431123243341123243342123243412123243413123243421' \
                            '123243423123321324123324341123324342123324421123324423123324431123341412123341413' \
                            '123342412123342413123342423123342431123421423123423431124241412124241413124241423' \
                            '124324341124324342124324421124324423124324432124341413124341432124342413124342423' \
                            '124342432124423432134341413134423432234342423'[seed: seed + 9]
        else:
            return error("Unsupported dimension")
        array = list(map(lambda x: int(x), result_string))
        return matrix(self.scramble([array[0:3], array[3:6], array[6:9]], row, column, 0, transpose), 5)

    def basis_orthogonal(self, size, seed, rows, columns, negative):
        """
        Generates a random orthogonal basis
        :param size: Dimension of the vector space
        :param seed: The ID of the basis
        :param rows: The order of the rows
        :param columns: The order of the columns
        :param negative: Binary representation of which rows and columns to multiply by -1
        :return: Random orthogonal basis
        """
        if get_types(size, seed, rows, columns, negative) != (NUMBER, NUMBER, NUMBER, NUMBER, NUMBER):
            return error(undefined)
        size, seed, rows, columns, negative = int(size), int(seed), int(rows), int(columns), int(negative)
        if size == 4:
            seed = 16 * self._validate(seed, 26)
            seed = '00010188087018080001078008181088001108171188178000110826118826800011086211882608' \
                   '00110871118817080011118817262671001111881762261700120827168021880012086112882708' \
                   '00220817178022880022087117082288002217262288267100221762228826170111117817811817' \
                   '01111187171818710112128718612718011216811827217801221826227826810122186222872618' \
                   '11121277176127171112167117272177112217262277267111221762227726171222226726722726' \
                   '1222227626272762'[seed: seed + 16]
        elif size == 5:
            seed = 25 * self._validate(seed, 39)
            seed = '000111563522288336713725300011156353336633671372530001115653222883361737235' \
                   '000111565333366336173723500011165352228832753363710001116535327533336636371' \
                   '000111655322288327353631700011165533273533366363170001122288237352557127335' \
                   '000112228823753255172735300011237352557127335333660001123753255172735333366' \
                   '000221563533377336713725300022156533337733617372350002216535327533337736371' \
                   '000221655332735333773631700022237352557127335333770002223753255172735333377' \
                   '002221188817255356153565100222118881733635372357320022211888173633532735723' \
                   '002221188817525351653556100222118881755235156355160022211888176333523735273' \
                   '112331735533637336733562211233175333363733673352661133317255336663561535651' \
                   '113331733633666353723573211333173633366635327357231133317525336663516535561' \
                   '113331755233666351563551611333176333366635237352731222221666261662661626661' \
                   '123332635632775357153655112333263653275735751365151233326536327753517536551' \
                   '123332656332757351573651512333266353257735571361551233326653325773551736155'[seed: seed + 25]
        else:
            return error("Unsupported dimension")
        array = []
        for y in range(size):
            row = []
            for x in range(size):
                row.append(int(seed[size * y + x]) - 4)
            array.append(row)

        rows = self._validate(rows, factorial(size))
        for y in range(size - 1):
            rows = rows % (size - y)
            rows //= size - y
            array.append(array.pop(rows))

        columns = self._validate(columns, factorial(size))
        for x in range(size - 1):
            col = columns % (size - x)
            columns //= size - x
            for y in range(size):
                array[y].append(array[y].pop(col))

        negative = self._validate(negative, 4**size)
        for y in range(size):
            rows = negative % 2
            negative //= 2
            col = negative % 2
            negative //= 2
            for x in range(size):
                if rows:
                    array[y][x] *= -1
                if col:
                    array[x][y] *= -1

        return basis(map(lambda v: matrix(map(lambda c: [c], v)), array), size)
