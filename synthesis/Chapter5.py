from theorems import Theorems, Connection

import Chapter2
import Chapter4

#5.1
class Orthogonal(Theorems):
    def __init__(self):
        super().__init__("Orthogonal")
        self.unlocks()

    def unlocks(self):
        #LinearDependence from Chapter2.py
        self.next.append(Chapter2.LinearDependence())
        self.complexity.append(3)

class OrthogonalBasis(Theorems):
    def __init__(self):
        super().__init__("OrthogonalBasis")
        self.unlocks()

    def unlocks(self):
        #Orthogonal
        self.next.append(Orthogonal())
        self.complexity.append(2)

        # Basis from Chapter4.py
        self.next.append(Chapter4.Nxn())
        self.complexity.append(4)

class Orthonormal(Theorems):
    def __init__(self):
        super().__init__("OrthogonalBasis")
        self.unlocks()

    def unlocks(self):
        """append values to next and complexity"""
        pass

#5.2
class OrthogonalProjection(Theorems):
    def __init__(self):
        super().__init__("OrthogonalProjection")
        self.unlocks()

    def unlocks(self):
        #Orthogonal
        self.next.append(Orthogonal())
        self.complexity.append(2)

class OrthogonalComplement(Theorems):
    def __init__(self):
        super().__init__("OrthogonalComplement")
        self.unlocks()

    def unlocks(self):
        # Orthogonal
        self.next.append(Orthogonal())
        self.complexity.append(2)

#5.3
#Not much to add

#5.4
#also called spectral theorem and spectral decomposition
class Spectral(Theorems):
    def __init__(self):
        super().__init__("Spectral")
        self.unlocks()

    def unlocks(self):
        """append values to next and complexity"""
        pass

