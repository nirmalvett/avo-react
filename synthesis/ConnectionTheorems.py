def addConnection(fullGraph):
    """
    :param fullGraph Matrices obj:
    :return:
    """
    import Chapter3
    #conditions here
    if fullGraph == -1:
        raise Exception("addConnections was called from ConnectionTheorems.py - this is an unsupported call")

    if fullGraph.matrices["matA"].inGraph("Rref") and fullGraph.matrices["matB"].inGraph("Identity"):
        fullGraph.matrices["matA"].addNode("Rref",Chapter3.InverseOfX())
        fullGraph.matrices["matB"].addNode("Identity",Chapter3.InverseOfX())


if __name__ == "__main__":
    addConnection(-1)