from synthesis.theorems import Theorems

#Section 2.2:
# class Nxn(theorems.Theorems):
#     def __init__(self):
#         super().__init__("Nxn")
#         G.add_node("Nxn")
#         self.unlocks()
#     def unlocks(self):
#         """append values to next and complexity"""
#         #Invertible
#         self.next.append(theorems.Invertible())
#         self.complexity.append(2)
#         G.add_edge("DetGreater0", "Invertible")

# class Theorems:
#     """
#     :param next: []Theorems
#     :param complexity: []int
#     :param value : String
#     """
#     def __init__(self,value):
#         self.next = []
#         self.complexity = []
#         self.value = value
#
#     @abstractmethod
#     def unlocks(self):
#         pass


class Ref(Theorems):
    def __init__(self):
        super().__init__("Ref")
        self.unlocks()
    def unlocks(self):
        """append values to next and complexity"""
        pass

class Rref(Theorems):
    def __init__(self):
        super().__init__("Rref")
        self.unlocks()
    def unlocks(self):
        """append values to next and complexity"""
        #Ref
        self.next.append(Ref())
        self.complexity.append(1)

"""Elementary Row Operations"""
# class ElemRowOp(theorems.Theorems):
#     def __init__(self):
#         super().__init__("ElemRowOp")
#         G.add_node("ElemRowOp")
#         self.unlocks()
#     def unlocks(self):
#         """append values to next and complexity"""
#         pass

class RowEquivalence(Theorems):
    def __init__(self):
        super().__init__("RowEquivalence")
        self.unlocks()
    def unlocks(self):
        pass

class GaussianElinination(Theorems):
    def __init__(self):
        super().__init__("GaussianElimination")
        self.unlocks()
    def unlocks(self):
        pass

class Rank(Theorems):
    def __init__(self):
        super().__init__("Rank")
        self.unlocks()

        # def __init__(self,nodes,complexities):
        #     super().__init__.(self,nodes,complexities)
    def unlocks(self):
        """append values to next and complexity"""
        pass

class Homogeneous(Theorems): # at least 1 solution
    def __init__(self):
        super().__init__("Homogeneous")
        self.unlocks()

        # def __init__(self,nodes,complexities):
        #     super().__init__.(self,   wnodes,complexities)
    def unlocks(self):
        """append values to next and complexity"""
        pass

class Consistent(Theorems):
    def __init__(self):
        super().__init__("Consistent")
        self.unlocks()

    def unlocks(self):
        """append values to next and complexity"""
        pass

#Section 2.3:
class Span(Theorems):
    def __init__(self):
        super().__init__("Span")
        self.unlocks()
    def unlocks(self):
        pass

class LinearDependence(Theorems):
    def __init__(self):
        super().__init__("LinearDependence")
        self.unlocks()
    def unlocks(self):
        pass

class LinearIndependence(Theorems):
    def __init__(self):
        super().__init__("LinearIndependence")
        self.unlocks()
    def unlocks(self):
        pass
