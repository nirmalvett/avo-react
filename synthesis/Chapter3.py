from synthesis.theorems import Theorems, Connection

import Chapter2

# class Diagonal(Theorems):
#     def __init__(self):
#         super().__init__("Diagonal")
#         G.add_node("Diagonal")
#         self.unlocks()
#     def unlocks(self):
#         """append values to next and complexity"""
#         pass


#3.1
class Diagonal(Theorems):
    def __init__(self):
        super().__init__("Diagonal")
        self.unlocks()
    def unlocks(self):
        """append values to next and complexity"""
        pass

class Identity(Theorems):
    def __init__(self):
        super().__init__("Identity")
        self.unlocks()
    def unlocks(self):
        """append values to next and complexity"""
        #RREF
        self.next.append(Chapter2.Rref())
        self.complexity.append(1)

        #Nxn
        self.next.append(Nxn())
        self.complexity.append(1)

        #Diagonal
        self.next.append(Diagonal())
        self.complexity.append(1)

class ScalarMatrix(Theorems):
    def __init__(self):
        super().__init__("ScalarMatrix")
        self.unlocks()
    def unlocks(self):
        """append values to next and complexity"""
        # Diagonal
        self.next.append(Diagonal())
        self.complexity.append(1)

class Zero(Theorems):
    def __init__(self):
        super().__init__("Zero")
        self.unlocks()
    def unlocks(self):
        """append values to next and complexity"""
        pass

class Nxn(Theorems):
    def __init__(self):
        super().__init__("Nxn")
        self.unlocks()

    # def __init__(self,nodes,complexities):
    #     super().__init__.(self,nodes,complexities)
    def unlocks(self):
        pass

class Symmetrical(Theorems):
    def __init__(self):
        super().__init__("Symmetrical")
        self.unlocks()
    def unlocks(self):
        """append values to next and complexity"""
        #Nxn
        self.next.append(Nxn())
        self.complexity.append(1)

class TransposeOfX(Connection):
    def __init__(self):
        super().__init__("TransposeofX")
        self.unlocks()
    def unlocks(self):
        pass

#3.2
#3.3

class DetNotZero(Theorems):
    def __init__(self):
        super().__init__("DetNotZero")

        self.unlcoks()

    #function to add nodes to connect to this node
    def unlcoks(self):
        """append values to next and complexity"""
        #nxn
        self.next.append(Nxn())
        self.complexity.append(1)

        #Invertible
        self.next.append(Invertible())
        self.complexity.append(1)

class Invertible(Theorems):
    def __init__(self):
        super().__init__("Invertible")
        self.unlocks()
    def unlocks(self):
        #eigenvalues greater 0
        # self.next.append(EigenvaluesGreater0())
        # self.complexity.append(1)
        # G.add_edge("Invertible", "EigenvaluesGreater0")
        self.next.append(Nxn())
        self.complexity.append(1)

class InverseOfX(Connection):
    def __init__(self):
        super().__init__("InverseOfX")
        self.unlocks()
    def unlocks(self):
        self.next.append(Invertible())
        self.complexity.append(1)
        #connection to BothXSquare

class Elementary(Theorems):
    def __init__(self):
        super().__init__("Elementary")
        self.unlocks()
    def unlocks(self):
        """append values to next and complexity"""
        # Invertible
        self.next.append(Invertible())
        self.complexity.append(1)

#3.4
class BothXSquare(Connection):
    def __init__(self):
        super().__init__("BothXSquare")
        self.unlocks()
    def unlocks(self):
        pass


#3.5 subpaces idk

# class test(Connection):
#     def __init__(self):
#         super().__init__("test")
#     def unlocks(self):
#         pass

class SameRowSpace(Connection):
    def __init__(self):
        super().__init__("SameRowSpace")
        self.unlocks()
    def unlocks(self):
        pass