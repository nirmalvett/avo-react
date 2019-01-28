from theorems import Theorems, Connection

import Chapter3

#4.1
class EigenVector(Theorems):
    def __init__(self):
        super().__init__("EigenVector")
        self.unlocks()

    def unlocks(self):
        """append values to next and complexity"""
        pass

class EigenValue(Theorems):
    def __init__(self):
        super().__init__("EigenValue")
        self.unlocks()

    def unlocks(self):
        """append values to next and complexity"""
        #EigenVector
        self.next.append(EigenVector())
        self.complexity.append(3)

#4.2
class Determinants(Theorems):
    def __init__(self):
        super().__init__("Determinants")
        self.unlocks()

    def unlocks(self):
        """append values to next and complexity"""
        pass

class Minor(Theorems):
    def __init__(self):
        super().__init__("Minor")
        self.unlocks()

    def unlocks(self):
        """append values to next and complexity"""
        #Minor
        self.next.append(Determinants())
        self.complexity.append(2)

class SquareMatrix(Theorems):
    def __init__(self):
        super().__init__("SquareMatrix")
        self.unlocks()

    def unlocks(self):
        """append values to next and complexity"""
        pass

class CramersRule(Theorems):
    def __init__(self):
        super().__init__("CramersRule")
        self.unlocks()

    def unlocks(self):
        """append values to next and complexity"""
        pass

#4.3
#Need to double check with Matthew, as I do not know if I should represent lambda to the n

#4.4
class SimilarMatrix(Theorems):
    def __init__(self):
        super().__init__("SimilarMatrix")
        self.unlocks()

    def unlocks(self):
        #Similar Matrices have the same determinant, rank, characteristic polynomial and eigenvalues
        # Determinants
        self.next.append(Determinants())
        self.complexity.append(3)
        # rank
        self.next.append(Chapter2.Rank())
        self.complexity.append(2)
        # Eigenvalue
        self.next.append(EigenValue())
        self.complexity.append(1)

class Diagonalizable(Theorems):
    def __init__(self):
        super().__init__("Diagonalizable")
        self.unlocks()

    def unlocks(self):
        #A is diagonalizable if A is an n*n matrix with n distinct values
        # Nxn from Chapter2.py
        self.next.append(Chapter3.Nxn())
        self.complexity.append(3)

class Bases(Theorems):
    def __init__(self):
        super().__init__("Bases")
        self.unlocks()

    def unlocks(self):
        """append values to next and complexity"""
        pass

