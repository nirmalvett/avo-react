import synthesis.theorems
from synthesis.helperClasses.minPriorityQueue import Queue, QueueNode

class StartingState:

    def __init__(self, nodes,theorems,complexities,name,info):
        """
        :param nodes: []Theoroems
        :param theorems: []strings
        :param complexities: []int
        """
        #next is an array of Theorems indicating the connecting nodes
        self.next = nodes
        #names is an array of strings with each string the theorem name of the node
        self.names = theorems
        #array of ints which indicates how hard it is to get from node A to node B
        self.complexity = complexities
        #name for the starting state - used to identify this matrix specifically in a dict
        self.name = name

        #info about rank, connections etc
        self.info = info

        # for item in self.names :
        #     G.add_edge("SS-"+name, item)


    def findPath(self,target):
        """
        :param target: String
        :return: []Theorems stack, int complexity
        """
        path,dist = self.complexityGraph()

        return path[target],dist[target]

    def complexityGraph(self):
        """
        :return: paths,distances (dict,dict)
        """

        # djikstra
        nodes = self.getGraph()
        dji = Queue()
        distances = {}
        paths = {}


        # distances[self.name+"SS"] = float("inf")

        # for node in nodes.keys():
        #     temp = QueueNode(node,float("inf"))
        #     dji.push(temp)
        #     distances[node] = float("inf")

        # add starting state to djikstra object
        begin = QueueNode("SS-" + self.name, 0)
        dji.push(begin)
        # distances["SS-" + self.name] = 0


        while not dji.isEmpty():
            closest = dji.popMin()
            vertex = closest.theorem
            if vertex not in distances or distances[vertex] > closest.value:
                distances[vertex] = closest.value

                if closest.djiFrom == "":
                    paths[vertex] = [vertex]
                else:
                    prevPath = paths[closest.djiFrom].copy()
                    # print(closest.djiFrom)
                    prevPath.append(vertex)
                    paths[vertex] = prevPath

                # put next nodes on the priority queue
                for ind, nextNode in enumerate(nodes[closest.theorem]["nextNodes"]):
                    # add back in
                    # need to put weight nodes in array
                    temp = QueueNode(nextNode,closest.value + nodes[closest.theorem]["complexity"][ind])
                    temp.djiFrom = vertex
                    dji.push(temp)

        return paths,distances



    def inGraph(self,target):
        """
        :param target: String
        :return: bool
        """
        if target in self.getGraph():
            return True
        else:
            return False


    def addNode(self,hookNode,insertNode,complex):
        """
        :param hookNode: string
        :param insertNode: Theorems
        :param complex: int
        :return: void
        """
        #dfs to find node and append insertNode
        visited = {}

        stack = []
        for startingConditions in self.next:
            stack.append(startingConditions)

        while stack:
            vertex = stack.pop()
            if vertex.value not in visited:
                visited[vertex.value] = "1"

                if vertex.value == hookNode:
                    vertex.next.append(insertNode)
                    vertex.complexity.append(complex)
                    # G.add_edge(vertex.value,insertNode.value)
                    break

                for nextNode in vertex.next:
                    stack.append(nextNode)

    def getGraph(self):
        """
        :return: dict{}
        """

        #{node, []next}

        fullGraph = {}
        fullGraph['SS-'+self.name] = {"type": 'b',"nextNodes":[i.value for i in self.next],"complexity":self.complexity}

        queue = self.next.copy()

        while queue:
            vertex = queue.pop(0)
            if isinstance(vertex,theorems.Connection):
                colour = 'c'
            else:
                colour = 'b'


            fullGraph[vertex.value] = {"type":colour,"nextNodes":[i.value for i in vertex.next],"complexity":vertex.complexity}

            for nextNode in vertex.next:
                if nextNode.value not in fullGraph:
                    queue.append(nextNode)


        return fullGraph