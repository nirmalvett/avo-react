import React, {Component} from 'react';
import cytoscape, {ElementsDefinition} from 'cytoscape';
// @ts-ignore
import dagre from 'cytoscape-dagre';
import * as Http from '../Http';

interface Concept {
    conceptID: number;
    name: string;
    lesson: string;
}

interface Edge {
    child: number;
    parent: number;
    weight: number;
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
    concepts: Concept[];
    edges: Edge[];
    setTagIndex: (index: number) => void;
}

interface TreeViewState {
    selectedConceptID: number;
}

export default class TreeView extends Component<TreeViewProps, TreeViewState> {
    constructor(props: TreeViewProps) {
        super(props);
        this.state = {
            selectedConceptID: -1,
        };
    }

    render() {
        return (
            <div
                id='cy'
                style={{
                    flex: 1,
                    height: '83.65vh',
                    borderRadius: '0px 28px 28px 0px',
                    background: 'rgba(0,0,0,0.075)',
                    overflow: 'hidden',
                }}
            />
        );
    }

    init() {
        const _this = this;

        const nodes: ElementsDefinition['nodes'] = [];
        const edges: ElementsDefinition['edges'] = [];

        this.props.concepts.forEach(Concept => {
            nodes.push({
                data: {
                    id: 'node-' + Concept.conceptID + '-end', // the + '-end' is for later on filtering
                },
                style: {
                    content:
                        Concept.name.length > 28
                            ? Concept.name.substring(0, 25) + '...'
                            : Concept.name,
                },
            });
        });

        this.props.edges.forEach(Edge => {
            edges.push({
                data: {
                    source: 'node-' + Edge.parent + '-end',
                    target: 'node-' + Edge.child + '-end',
                    id: 'between-' + Edge.parent + '-' + Edge.child,
                },
            });
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
                        'background-color': _this.props.theme.theme === 'light' ? 'grey' : 'white',
                        width: 50,
                        height: 50,
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
                },
            ],
            elements: {nodes, edges},
        });
        (window as any).cy.on('click', 'node', function() {
            // (window as any).cy.fit(this, 250);
            // @ts-ignore
            _this.selectNode(this.id());
        });
    }

    componentDidMount() {
        this.init();
    }

    addRepopulateData(_concepts: Concept[], _edges: Edge[]) {
        const nodes: ElementsDefinition['nodes'] = [];
        const edges: ElementsDefinition['edges'] = [];

        _concepts.forEach(Concept => {
            nodes.push({
                data: {
                    id: 'node-' + Concept.conceptID + '-end', // the + '-end' is for later on filtering
                },
                style: {
                    content:
                        Concept.name.length > 28
                            ? Concept.name.substring(0, 25) + '...'
                            : Concept.name,
                },
            });
        });

        _edges.forEach(Edge => {
            edges.push({
                data: {
                    source: 'node-' + Edge.parent + '-end',
                    target: 'node-' + Edge.child + '-end',
                    id: 'between-' + Edge.parent + '-' + Edge.child,
                },
            });
        });
        (window as any).cy.json({elements: {nodes, edges}});
    }

    selectNode(nodeID: String) {
        const tagID = parseInt(nodeID.split('-')[1]);

        const nodesToSelect = [tagID];

        if (!!this.getParentNodes(tagID).length)
            nodesToSelect.push(...this.getParentNodes(tagID).map(Concept => Concept.conceptID));
        nodesToSelect.push(...this.getChildNodes(tagID).map(Concept => Concept.conceptID));

        (window as any).cy.fit(
            (window as any).cy.$(...nodesToSelect.map(number => `#node-${number}-end`)),
            250,
        );

        (window as any).cy.nodes().forEach((node: any) => {
            let nodeColour = this.props.theme.theme === 'light' ? 'grey' : 'white';
            const nodeID = parseInt(node.id().split('-')[1]);
            if (nodeID === tagID) nodeColour = this.props.theme.color[500];
            node.style('background-color', nodeColour);
        });
        this.setState({selectedConceptID: tagID});
        this.props.setTagIndex(
            this.props.concepts.map(Concept => Concept.conceptID).indexOf(tagID),
        );
    }

    getParentNodes(id: number) {
        const parentNodes: Concept[] = [];
        const conceptMapByID: {[key: number]: Concept} = {};
        this.props.concepts.forEach(Concept => (conceptMapByID[Concept.conceptID] = Concept));
        this.props.edges.forEach(Edge => {
            if (Edge.child === id) parentNodes.push(conceptMapByID[Edge.parent]);
        });
        return parentNodes;
    }

    getChildNodes(id: number) {
        const childNodes: Concept[] = [];
        const conceptMapByID: {[key: number]: Concept} = {};
        this.props.concepts.forEach(Concept => (conceptMapByID[Concept.conceptID] = Concept));
        this.props.edges.forEach(Edge => {
            if (Edge.parent === id) childNodes.push(conceptMapByID[Edge.child]);
        });
        return childNodes;
    }
}
