import React, { Component } from 'react';
import cytoscape, {ElementsDefinition} from 'cytoscape';
// @ts-ignore
import dagre from 'cytoscape-dagre';
import * as Http from '../../Http';

interface TagNode {
    childOrder: number; 
    parent: any; 
    tagID: number; 
    tagName: string;
}

interface TreeViewProps {
    theme: {
        color: {
            '100': string;
            '200': string;
            '500': string;
        };
        theme: 'light' | 'dark';
    };
    nodes: TagNode[];
}

interface TreeViewState {
    selectedNodeID: number;
    nodes: TagNode[];
}

export default class TreeView extends Component<TreeViewProps, TreeViewState>
{
    constructor(props: TreeViewProps) {
        super(props);
        this.state = {
            selectedNodeID : -1,
            nodes: this.props.nodes
        }
    };

    render() {
        return (
            <div 
                id='cy' 
                style={{
                    flex: 1, 
                    height: '83.65vh',
                    borderRadius: '0px 28px 28px 0px',
                    background: 'rgba(0,0,0,0.075)',
                    overflow: 'hidden'
                }} 
            />
        );
    };

    componentDidMount() {
        const _this = this;
        const data = _this.props.nodes;
        const nodes: ElementsDefinition['nodes'] = [];
        const edges: ElementsDefinition['edges'] = [];

        this.setState({ nodes : data });
        data.forEach(el => {
            nodes.push({
                data: {
                    id: 'node-' + el.tagID + '-end', // the + '-end' is for later on filtering
                },
                style: {
                    content: el.tagName.length > 28 ? el.tagName.substring(0, 25) + '...' : el.tagName,
                },
            });
            if (el.parent !== null) {
                edges.push({
                    data: {target: 'node-' + el.tagID + '-end', source: 'node-' + el.parent + '-end'},
                });
            }
        });
        cytoscape.use(dagre);
        (window as any).cy = cytoscape({
            container: document.getElementById('cy'),
            boxSelectionEnabled: false,
            autounselectify: true,
            layout: {
                name: 'dagre',
                spacingFactor: 2.25,
            },
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color' : _this.props.theme.theme === 'light' ? 'grey' : 'white',
                        'width'            : 50,
                        'height'           : 50
                    },
                },
                {
                    selector: 'edge',
                    style: {
                        width: 4,
                        'target-arrow-shape': 'triangle',
                        'line-color': _this.props.theme.color[100],
                        'target-arrow-color': _this.props.theme.color[100],
                        'curve-style': 'bezier',
                    },
                }
            ],
            elements: {nodes, edges},
        });
        (window as any).cy.on('click', 'node', function() {
            // (window as any).cy.fit(this, 250);
            _this.selectNode(this.id());
        });

    };

    selectNode(nodeID: String) {
        const tagID = nodeID.split('-')[1];
        const nodesToSelect = [parseInt(tagID)];
        if(!!this.getNodeParent(tagID))
            nodesToSelect.push(this.getNodeParent(tagID).tagID);
        nodesToSelect.push(...this.getChildNodes(tagID).map(n => n.tagID));
        console.log(nodesToSelect);
        (window as any).cy.fit((window as any).cy.$(...nodesToSelect.map(number => `#node-${number}-end`)), 250);

        (window as any).cy.nodes().forEach((node : any) => {
            let nodeColour = this.props.theme.theme === 'light' ? 'grey' : 'white';
            const nodeID = node.id().split('-')[1];
            if(nodeID === tagID) nodeColour = this.props.theme.color[500]; 
            node.style('background-color', nodeColour);            
        });
        this.setState({ selectedNodeID : parseInt(tagID) });
    };

    getNodeParent(id: string) {
        return this.state.nodes[this.state.nodes.map( TagNode => `${TagNode.parent}`).indexOf(id)];
    };

    getChildNodes(id: string) {
        return this.state.nodes.filter(TagNode => TagNode.parent == id);
    };
};

// const data: ElementsDefinition = {
//     nodes: [
//         {data: {id: 'n0'}},
//         {data: {id: 'n1'}},
//         {data: {id: 'n2'}},
//         {data: {id: 'n3'}},
//         {data: {id: 'n4'}},
//         {data: {id: 'n5'}},
//         {data: {id: 'n6'}},
//         {data: {id: 'n7'}},
//         {data: {id: 'n8'}},
//         {data: {id: 'n9'}},
//         {data: {id: 'n10'}},
//         {data: {id: 'n11'}},
//         {data: {id: 'n12'}},
//         {data: {id: 'n13'}},
//         {data: {id: 'n14'}},
//         {data: {id: 'n15'}},
//         {data: {id: 'n16'}},
//     ],
//     edges: [
//         {data: {source: 'n0', target: 'n1'}},
//         {data: {source: 'n1', target: 'n2'}},
//         {data: {source: 'n1', target: 'n3'}},
//         {data: {source: 'n4', target: 'n5'}},
//         {data: {source: 'n4', target: 'n6'}},
//         {data: {source: 'n6', target: 'n7'}},
//         {data: {source: 'n6', target: 'n8'}},
//         {data: {source: 'n8', target: 'n9'}},
//         {data: {source: 'n8', target: 'n10'}},
//         {data: {source: 'n11', target: 'n12'}},
//         {data: {source: 'n12', target: 'n13'}},
//         {data: {source: 'n13', target: 'n14'}},
//         {data: {source: 'n13', target: 'n15'}},
//     ],
// };
