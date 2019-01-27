class Conditional:
    def __init__(self,requirement,unlock,complex,head):
        """
        :param requirement: []Theorems
        :param unlock: []Theorems
        :param complex: []int
        :param head: StartingState
        """
        self.requirements = requirement
        self.metRequirements = []
        self.unlocks = unlock
        self.complexity = complex
        self.head = head

    def dfs(self,start,target):
        """
        :param start:Theorems
        :param target Theorems
        :return :boolean
        """
        #checks if the target is in the node - for accepting conditionals

        stack = [start]

        while stack:
            vertex = stack.pop()
            if vertex.value == target.value:
                return True
            for nextNode in vertex.next:
                stack.append(nextNode)

        return False


    def exists(self,theory):
        """
        :param theory: Theorems
        :param head: StartingState
        :return :boolean
        """
        for item in self.head.next:
            if self.dfs(item,theory):
                return True

    def check(self):
        """
        :return: boolean
        """
        #if elements in requriements exists in the graph,
            #move from requirements to metRequirements
        #if requirements = empty
            #add nodes in unlocks[] to graphWhere
        pastReqirements = self.requirements.copy()
        for requirement in pastReqirements:
            if self.exists(requirement):
                self.metRequirements.append(requirement)
                self.requirements.remove(requirement)

        if not self.requirements:
            return True
        else:
            return False

    def unlockNodes(self):
        """
        :return: [] Theorems
        """
        #This function unlocks nodes in the array unlocks
        #adds an edge from each node in metRequirements to unlocks
        if not self.requirements:
            # return self.metRequirements
            for item in self.metRequirements:
                for ind,unlock in enumerate(self.unlocks):
                    self.head.addNode(item.value,unlock,self.complexity[ind])


class graphConditionals:
    def __init__(self):
        self.allConditionals = []

    def addConditional(self,requirement,unlock,complex,head):
        """
        :param requirement: []Theorems
        :param unlock: []Theorems
        :param head: StartingState
        :param compelex: []int
        :return: None
        """
        self.allConditionals.append(Conditional(requirement,unlock,complex,head))

    def checkConditionals(self):
        pastConditionals = self.allConditionals.copy()
        for condition in pastConditionals:
            if condition.check():
                condition.unlockNodes()
                self.allConditionals.remove(condition)
