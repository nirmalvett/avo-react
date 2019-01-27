def main():
    # create nodes here

    class MultiMatGraph():
        def __init__(self):
            self.matrices = {}

    import Chapter3
    import Chapter2
    import Chapter4
    import Chapter5

    from StartingState import StartingState

    # startingNodes = [Chapter3.Identity(),Chapter3.Nxn()]
    # startingTheorems = ["Identity","Nxn"]


    # startingNodes = [Chapter3.Identity(),Chapter3.ScalarMatrix()]
    # startingTheorems = ["Identity","ScalarMatrix"]

    startingNodes = [Chapter3.InverseOfX()]
    startingTheorems = ["InverseOfX"]

    startingComplexities = [0]

    start = StartingState(startingNodes, startingTheorems, startingComplexities,"matA",{})

    # other = StartingState([Chapter3.InverseOfX(),Chapter3.ScalarMatrix()],["InverseofX", "ScalarMatrix"],[0, 0],"matB")
    # other = StartingState([Chapter3.InverseOfX(), Chapter4.Diagonalizable()], ["InverseofX", "Diagonalizable"], [0, 0], "matB")
    # other = StartingState([Chapter3.InverseOfX(), Chapter5.Orthogonal()], ["InverseofX", "Orthogonal"], [0, 0], "matB")
    other = StartingState([Chapter3.InverseOfX(), Chapter3.Identity(), Chapter3.ScalarMatrix()], ["InverseofX", "Identity","ScalarMatrix"], [0, 0,0], "matB",{})


    full = MultiMatGraph()
    full.matrices[start.name] = start

    full.matrices[other.name] = other


    from ConditionalTheorems import addConditions

    for state in full.matrices:
        addConditions(full.matrices.get(state))

    from ConnectionTheorems import addConnection
    addConnection(full)

    print(full.matrices["matB"].getGraph())

    print(full.matrices["matB"].complexityGraph())


    return full.matrices


if __name__ == "__main__":
    main()