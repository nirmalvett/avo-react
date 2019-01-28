def addConditions(state):
    import synthesis.conditional as conditional
    import synthesis.Chapter3 as Chapter3
    import synthesis.Chapter2 as Chapter2

    if state == -1:
        raise Exception("addConditions was called from main - this is an unsupported call")

    conditions = conditional.graphConditionals()
    # add conditions here

    #requirement,unlock,head
    # list ,     list,  starting state

    # if Nxn and Diagonal then Symmetric
    conditions.addConditional([Chapter3.Nxn(), Chapter3.Diagonal()], [Chapter3.Symmetrical()], [3], state)

    # if Rref and Nxn then invertible
    conditions.addConditional([Chapter2.Rref(), Chapter3.Nxn()], [Chapter3.Invertible()], [3], state)


    # check conditionals
    conditions.checkConditionals()

if __name__ == "__main__":
    addConditions(-1)