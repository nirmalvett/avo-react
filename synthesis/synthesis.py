import Matrices

# import networkx as nx
import matplotlib.pyplot as plt

mats = Matrices.main()

# for i in mats:
#     print(i,mats[i].next)
#
# print(mats["matA"].next[1].next)
#
# print(mats["matA"].getGraph())
# print(mats["matB"].getGraph())

# from Graph import draw
#
# for mat in mats:
#     draw(mats[mat])

Gr = nx.DiGraph()

Gr.add_nodes_from(mats["matA"].getGraph().keys())

fullA = mats["matA"].getGraph()

for k,v in fullA.items():
    Gr.add_edges_from(([(k, t) for t in v["nextNodes"]]))

colourMap = []

for node in Gr:
    if fullA[node]["type"] == 'c':
        colourMap.append('orange')
    else:
        colourMap.append('blue')

nx.draw_circular(Gr, node_color=colourMap,with_labels=True,alpha=0.65)

plt.title('matA')
plt.show()

G = nx.DiGraph()

G.add_nodes_from(mats["matB"].getGraph().keys())

fullB = mats["matB"].getGraph()

for k,v in fullB.items():
    G.add_edges_from(([(k, t) for t in v["nextNodes"]]))

colourMap = []

for node in G:
    if fullB[node]["type"] == 'c':
        colourMap.append('orange')
    else:
        colourMap.append('blue')

nx.draw_circular(G, node_color=colourMap,with_labels=True,alpha=0.65)

plt.title('matB')
plt.show()


# print(fullA)
# print(fullB)

matrix = input("which matrix to use? matA/matB: ")
targetNode = input("find path from which node?")

fullPath = mats[matrix].findPath(targetNode)

# print(fullPath)

count = 1

edge_path = []



for short_theorem in fullPath:
    if short_theorem != "SS-"+matrix:
        edge_path.append((fullPath[count],fullPath[count-1]))
        count +=1


print(fullPath)

# if matrix == 'matA':
#     pathGraph = Gr
# else:
#     pathGraph = G
#
# pos = nx.circular_layout(pathGraph)
#
# nx.draw_networkx_nodes(pathGraph,pos,nodelist=fullPath,node_color='r')
# nx.draw_networkx_edges(pathGraph,pos,edgelist=edge_path,edge_color='r',width=10)

Gp = nx.DiGraph()

if matrix == 'matA':
    fullMat = mats["matA"].getGraph()
else:
    fullMat = mats["matB"].getGraph()


Gp.add_nodes_from(fullMat.keys())

for k,v in fullMat.items():
    Gp.add_edges_from(([(k, t) for t in v[1]]))

colourMap = []

for node in Gp:
    if node in fullPath:
        colourMap.append('red')
    elif fullMat[node][0] == 'c':
        colourMap.append('orange')
    else:
        colourMap.append('blue')


nx.draw_circular(Gp, node_color=colourMap,with_labels=True,alpha=0.65)

plt.show()



print("Given is a matrix is ", end='')
for state in fullMat['SS-'+matrix]:
    print(state, ", ", end='')

print("prove that the matrix is ",targetNode, end='')
print("\n\n\n")

print("the path is: ",end='')
for edge in reversed(edge_path):
    print(edge[0]," -> ", edge[1],", ", end='')

print("\n\n\n")
