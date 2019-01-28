#fibonacci heap implementation of a minimum priority queue

class QueueNode:
    def __init__(self,name,val):
        """
        :string mat:
        :string name:
        :int val:
        """
        self.theorem = name
        self.value = val

        self.degree = 0

        self.djiFrom = ""

        #array of QueueNodes
        self.next = []


class Queue:

    def __init__(self):
        #array of heaps - fibonacci heap structure
        """[]QueueNode"""
        self.roots = []
        #index where the heap with the minimum value is
        """int"""
        self.minInd = 0

    def push(self,item):
        """
        :QueueNode item:
        :return: None
        """
        self.roots.append(item)
        if self.roots[self.minInd].value > item.value:
            self.minInd = len(self.roots)-1


    def popMin(self):
        """
        :return: QueueNode(with next[] stripped)
        """

        #pop off minimum value
        a = self.roots.pop(self.minInd)

        #put children on root list
        for nextNode in a.next:
            self.roots.append(nextNode)

        cleanedUp = {}

        while self.roots:
            if self.roots[0].degree in cleanedUp:
                #merge these two roots push it back on self.roots
                temp = cleanedUp.pop(self.roots[0].degree)
                popped = self.roots.pop(0)
                if temp.value < popped.value:
                    temp.next.append(popped)
                    self.roots.append(temp)
                else:
                    popped.next.append(temp)
                    self.roots.append(popped)
            else:
                deg = self.roots[0].degree
                cleanedUp[deg] = self.roots.pop(0)

        self.roots = []
        count = 0
        tempMin = float("-inf")
        for key,val in cleanedUp.items():
            self.roots.append(val)
            if tempMin > val.value:
                self.minInd = count
            count+=1
        #clean return value

        a.next = []
        return a

    def isEmpty(self):
        return not self.roots
