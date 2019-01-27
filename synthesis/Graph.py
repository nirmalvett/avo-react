import networkx as nx
import matplotlib.pyplot as plt


G = nx.DiGraph()

ans = ""
def draw(state):
    pos = nx.spring_layout(G)
    nx.draw_networkx_nodes(G, pos,node_color='g')
    nx.draw_networkx_labels(G, pos)
    nx.draw_networkx_edges(G, pos)


    #create conditionals

    print("OPTIONS: Invertible, Nxn, Ref, Rref, Identity, Symmetrical, Diagonal, ScalarMatrix")
    node = input("find path from node?  ")
    #OPTIONS: Invertible, DetGreater0, EigenvaluesGreater0, Nxn

    path_to_node = state.findPath(node)

    if not path_to_node:
        print("node does not exist")
    else:

        path_to_node.pop()
        count = 1

        edge_path = []



        for short_theorem in path_to_node:
            if short_theorem != "SS-"+state.name:
                edge_path.append((path_to_node[count],path_to_node[count-1]))
                count +=1
        # print(edge_path)

        nx.draw_networkx_nodes(G,pos,nodelist=path_to_node,node_color='r')
        nx.draw_networkx_edges(G,pos,edgelist=edge_path,edge_color='r',width=10)

        print("Given is a matrix is ", end='')
        for state in state.names:
            print(state, ", ", end='')

        print("prove that the matrix is ",edge_path[0][1], end='')
        print("\n\n\n")

        print("the path is: ",end='')
        for edge in reversed(edge_path):
            print(edge[0]," -> ", edge[1],", ", end='')

        print("\n\n\n")

        # nx.ge

        plt.show()
