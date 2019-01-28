def main(case):
    # create nodes here

    class MultiMatGraph():
        def __init__(self):
            self.matrices = {}

    import synthesis.Chapter3 as Chapter3
    import synthesis.Chapter2 as Chapter2
    import synthesis.Chapter4 as Chapter4
    import synthesis.Chapter5 as Chapter5

    from synthesis.StartingState import StartingState

    # startingNodes = [Chapter3.Identity(),Chapter3.Nxn()]
    # startingTheorems = ["Identity","Nxn"]


    # startingNodes = [Chapter3.Identity(),Chapter3.ScalarMatrix()]
    # startingTheorems = ["Identity","ScalarMatrix"]

    if case == "A":
        a = 3

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


    from synthesis.ConditionalTheorems import addConditions

    for state in full.matrices:
        addConditions(full.matrices.get(state))

    from synthesis.ConnectionTheorems import addConnection
    addConnection(full)

    print(full.matrices["matB"].getGraph())

    print(full.matrices["matB"].complexityGraph())


    return full.matrices


if __name__ == "__main__":
    main()