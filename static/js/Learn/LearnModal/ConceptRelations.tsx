import React, { Component } from 'react';
import {Modal, Backdrop, Grow, Paper, Typography, IconButton, Tooltip} from '@material-ui/core';
import {Close} from '@material-ui/icons';
import cytoscape, {ElementsDefinition} from 'cytoscape';
// @ts-ignore
import dagre from 'cytoscape-dagre';
import {AvoLesson} from '../Learn';

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

interface ConceptRelationsModalProp {
    readonly open : boolean;
    readonly closeCallback : any;
    readonly edges: Edge[];
    readonly concepts: Concept[];   
    readonly currentLesson: AvoLesson
}

interface ConceptRelationsModalState {

};

export default class ConceptRelationsModal extends Component<ConceptRelationsModalProp, ConceptRelationsModalState> {

    constructor(props: ConceptRelationsModalProp) {
        super(props);
    };

    render() {
        return (
            <Modal
                open={this.props.open}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Grow in={this.props.open}>
                    <Paper className='avo-card' style={{ width : '60%', height : '65%', margin : 'auto', marginTop : '50px', position : 'relative' }}>
                        <Tooltip title={'Close'}>
                            <IconButton onClick={this.props.closeCallback} style={{ position : 'absolute', right : '8px', top : '8px' }}>
                                <Close color={'primary'}/>
                            </IconButton>
                        </Tooltip>
                        <div
                            id='cy'
                            style={{
                                flex: 1,
                                height: '100%',
                                width: '95%',
                                borderRadius: '28px',
                                background: 'rgba(0,0,0,0.075)',
                                overflow: 'hidden',
                            }}
                        />
                    </Paper>
                </Grow>
            </Modal>
        );
    };

    componentDidMount() {
        setTimeout(() => {
            const _this = this;
    
            const nodes: ElementsDefinition['nodes'] = [];
            const edges: ElementsDefinition['edges'] = [];
    
            const currentConcept: AvoLesson = this.props.currentLesson;
            const parentNodesOfConcept: Concept[] = this.getParentNodes(currentConcept.conceptID);
            const childNodesOfConcept: Concept[] = this.getChildNodes(currentConcept.conceptID);

            const relevantConcepts = [
                ...parentNodesOfConcept,
                {
                    conceptID : currentConcept.conceptID,
                    name : currentConcept.name,
                    lesson : currentConcept.lesson
                } as Concept,
                ...childNodesOfConcept
            ];

            const relevantConceptIds: number[] = [];
            relevantConcepts.forEach(Concept => {
                relevantConceptIds.push(Concept.conceptID);
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
                if(!!~relevantConceptIds.indexOf(Edge.child) && !!~relevantConceptIds.indexOf(Edge.parent))
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
                            'background-color': 'green',
                            width: 50,
                            height: 50,
                        },
                    },
                    {
                        selector: 'edge',
                        style: {
                            width: 4,
                            'target-arrow-shape': 'triangle',
                            'line-color': 'yellow',
                            'target-arrow-color': 'yellow',
                            'curve-style': 'bezier',
                        },
                    },
                ],
                elements: {nodes, edges},
            });
        }, 600); // timeout is to account for the delayed rendering of the modal
    };

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
};