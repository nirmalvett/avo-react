from abc import ABCMeta,abstractmethod

class Theorems:
    """
    :param next: []Theorems
    :param complexity: []int
    :param value : String
    """
    def __init__(self,value):
        self.next = []
        self.complexity = []
        self.value = value

    @abstractmethod
    def unlocks(self):
        pass


class Connection(Theorems):
    """
    :param next: []Theorems
    :param complexity: []int
    :param value : String
    """
    def __init__(self,value):
        super().__init__(value)
        # self.connectTo = conn

    @abstractmethod
    def unlocks(self):  
        pass


# class EigenvaluesGreater0(Theorems):
#     def __init__(self):
#         super().__init__("EigenvaluesGreater0")
#         G.add_node("EigenvaluesGreater0")
#         self.unlocks()
#     def unlocks(self):
#         pass

