
// Function mutates the data to include a hidden boolean
import {Concept} from "./TreeView";
import {Edge} from "./TreeView";

export function applyHiddenBooleanToAll(nodeID:number, concepts: Concept[], edges: Edge[]): void {
  const childrenHashMap = getChildrenHashMap(concepts, edges);
  const allDescentsIDArray = getAllDescendents(nodeID, concepts, edges, childrenHashMap);
  for (let i = 0; i < allDescentsIDArray.length; i++){
    const id = allDescentsIDArray[i];
    if (id !== nodeID)
      applyHiddenBooleanHelper(id, concepts);
  }
}

// function mutates the concept with the id to have a collapsed attribute set to true
function applyHiddenBooleanHelper(id:number, concepts:Concept[]): void{
    for (let i = 0; i < concepts.length; i++){
      const concept = concepts[i];
      if (concept.conceptID === id){
        concept.collapsed = true;
        break;
      }
  }
}

// function gets a { parentID: childID[]}
function getChildrenHashMap(concepts:Concept[], edges:Edge[]){
  let hashMap: {[conceptID:number]: number[]} = {};
  // add a key for every concept id
  for (let i = 0; i < concepts.length; i++){
    const conceptID = concepts[i].conceptID;
    hashMap[conceptID] = [];
  }
  // now loop through all edges
  for (let j = 0; j < edges.length; j++){
    const edge: Edge = edges[j];
    const childID = edge.child;
    const parentID = edge.parent;
    hashMap[parentID] = [...hashMap[parentID], childID];
  }
  return hashMap;

}

function getAllDescendents(nodeID:number, concepts:Concept[], edges:Edge[], childrenHashMap: {[conceptID:number]: number[]}, memoryHashmap: {[id:number]: true} = {}): number[]{

  // remember the IDs we already dealt with
  memoryHashmap[nodeID] = true;

  // find all the children for the given id
  let descendentsIDArray: number[] = childrenHashMap[nodeID] ? childrenHashMap[nodeID] : [];
  // get all descendents
  for (let i = 0; i < concepts.length; i++){
    const currentConcept = concepts[i];
    const conceptID = currentConcept.conceptID;
    if (!memoryHashmap[conceptID]){  // we will only interate iff the id isn't in memory
           descendentsIDArray = descendentsIDArray.concat(getAllDescendents(conceptID, concepts, edges, childrenHashMap, memoryHashmap));
    }
  }
  return descendentsIDArray;

}

