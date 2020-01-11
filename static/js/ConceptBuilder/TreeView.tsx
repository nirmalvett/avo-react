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
                    completion : !!Concept.lesson.length ? 1 : 0,
                    id: 'node-' + Concept.conceptID + '-end', // the + '-end' is for later on filtering
                },
                style: {
                    content: Concept.name.length > 28
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
                        'background-image': (data: any) => 'url(data:image/svg+xml;base64,' + this.getConceptIcon('grey', 150, data.data('completion')) + ')',
                        'width': '150px',
                        'height': '150px',
                        'text-valign': 'center',
                        'text-halign': 'right',
                        'font-size': 30,
                        'color': this.props.theme.theme == 'light' ? 'black' : 'white',
                        'background-opacity': 0,
                        'background-fit': 'cover',
                        'background-clip': 'node',
                    } as any,
                },
                {
                    selector: 'edge',
                    style: {
                        width: 4,
                        'target-arrow-shape': 'triangle',
                        'line-color': 'grey',
                        'target-arrow-color': 'grey',
                        'curve-style': 'bezier',
                        'line-style' : 'solid'
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

        (window as any).cy.animate({
            fit : { eles : (window as any).cy.$(...nodesToSelect.map(number => `#node-${number}-end`)), padding : 250 },
            duration : 500,
        });

        (window as any).cy.edges().forEach((edge: any) => {
            edge.style({
                'line-color': 'grey',
                'target-arrow-color': 'grey',
                'line-style' : 'solid'
            });
        });
        (window as any).cy.nodes().forEach((node: any) => {
            let nodeProps = {fill : 'grey', size : 150 };
            const nodeID = parseInt(node.id().split('-')[1]);
            if (nodeID === tagID) {
                nodeProps = {fill : this.props.theme.color[500], size : 200 };
                node.connectedEdges().forEach((edge: any) => {
                    edge.style({
                        'line-color': this.props.theme.color[500],
                        'target-arrow-color': this.props.theme.color[500],
                        'line-style' : 'dashed'
                    });
                });
            }else{
                node.connectedEdges().forEach((edge: any) => {
                    const edgeSource = parseInt(edge.data('source').split('-')[1]);
                    const edgeTarget = parseInt(edge.data('target').split('-')[1]);
                    if(edgeSource === tagID || edgeTarget === tagID)
                        nodeProps = {fill : this.props.theme.color[200], size : 175 };  
                }); 
            }
            node.style({
                'background-image': 'url(data:image/svg+xml;base64,' + this.getConceptIcon(nodeProps.fill, nodeProps.size, node.data('completion')) + ')',
                'width' : `${nodeProps.size}px`,
                'height': `${nodeProps.size}px`,
            });
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

    getConceptIcon(fill: string, size: number, completion: number) {
        const triangles = [];
        if(fill === this.props.theme.color[500]) {
            const rotate = (cx: number, cy: number, x: number, y: number, angle: number) => {
                let radians = (Math.PI / 180) * angle,
                    cos = Math.cos(radians),
                    sin = Math.sin(radians),
                    nx = cos * (x - cx) + sin * (y - cy) + cx,
                    ny = cos * (y - cy) - sin * (x - cx) + cy;
                return [nx, ny];
            };
            let currentRotation = 0;
            let rotationAmount = 45;
            let additionalRot = 0;
            let centerX = 24;
            let centerY = 24;
            let radius = 15;
            let items = [];
            for (let i = 0; i < 12; i++) {
                let x = [];
                let y = [];
                for (let j = 0; j < 2; j++) {
                    let newPoint = rotate(
                        centerX,
                        centerY,
                        centerX + radius,
                        centerY + radius,
                        360 - (currentRotation + rotationAmount * j + additionalRot), // remember, svgs tend to be inverted, so we need to invert this
                    );
                    x.push(newPoint[0]);
                    y.push(newPoint[1]);
                    currentRotation += rotationAmount;
                }
                if (i === 3 || i === 7) {
                    additionalRot += 22.5 + 22.5 / 3;
                    currentRotation = 0;
                }
                const tri_color = this.props.theme.color[500];
                items.push(
                    `<path
                        class='avo-progression-gauge-triangle'
                        d='M${centerX}, ${centerY} L${x[0]}, ${y[0]} L${x[1]}, ${y[1]} Z'
                        fill='${tri_color}'
                        fill-opacity='0.25'
                        stroke='${tri_color}'
                        stroke-width='0.25'
                        stroke-linecap='round'
                    />`,
                );
                if (i === 3 || i === 7 || i === 11) {
                    triangles.push(
                        `<g
                            style="transform-origin: center"
                            cx='${centerX}'
                            cy='${centerY}'
                            class='avo-progression-gauge-triangle-group${triangles.length + 1}'
                        >
                            ${items}
                        </g>`,
                    );
                    items = [];
                }
            }
        }
        // Path dimentsions are 24 24 - > translate accordingly
        return btoa(`
            <svg width='${size}px' height='${size}px' viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="shadow">
                        <feDropShadow dx="0.1" dy="0.4" stdDeviation="1"/>
                    </filter>
                </defs>
                ${triangles.join('')}
                <circle class="donut-ring" cx="24" cy="24" r="16" fill="transparent" stroke="#fafafa" stroke-width="0.25" stroke-dasharray="0.5"></circle>
                <circle class="avo-progression-gauge-svg" cx="24" cy="24" r="16" fill="transparent" stroke="${fill}" stroke-width="0.85" stroke-dasharray="${completion * 100} ${100 - (completion * 100)}" stroke-dashoffset="25" stroke-linecap="round"></circle>
                <circle r="13" cx="24" cy="24" fill="${this.props.theme.theme === 'dark' ? 'rgb(48, 48, 48)' : '#fff'}" style="filter:url(#shadow);"></circle>
                <g transform="translate(13, 11)">
                    <path fill='${fill}' stroke-width="1" d="M10.5 4.5c.28 0 .5.22.5.5v2h6v6h2c.28 0 .5.22.5.5s-.22.5-.5.5h-2v6h-2.12c-.68-1.75-2.39-3-4.38-3s-3.7 1.25-4.38 3H4v-2.12c1.75-.68 3-2.39 3-4.38 0-1.99-1.24-3.7-2.99-4.38L4 7h6V5c0-.28.22-.5.5-.5m0-2C9.12 2.5 8 3.62 8 5H4c-1.1 0-1.99.9-1.99 2v3.8h.29c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-.3c0-1.49 1.21-2.7 2.7-2.7s2.7 1.21 2.7 2.7v.3H17c1.1 0 2-.9 2-2v-4c1.38 0 2.5-1.12 2.5-2.5S20.38 11 19 11V7c0-1.1-.9-2-2-2h-4c0-1.38-1.12-2.5-2.5-2.5z"></path>
                </g>
            </svg>
        `);
    };
}