import React, { Component } from 'react';
import {Modal, Backdrop, Grow, Paper, Typography, IconButton, Tooltip} from '@material-ui/core';
import {Close} from '@material-ui/icons';
import {AvoLesson} from '../Learn';
import {ThemeObj} from '../../Models';
import cytoscape, {ElementsDefinition} from 'cytoscape';
// @ts-ignore
import dagre from 'cytoscape-dagre';

interface Concept {
    conceptID: number;
    name: string;
    lesson: string;
    type: number;
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
    readonly currentLesson: AvoLesson;
    readonly lessons: AvoLesson[];
    readonly theme: ThemeObj;
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
                    <Paper 
                        className='avo-card' 
                        style={{ 
                            width : '60%', 
                            height : '65%', 
                            margin : 'auto', 
                            marginTop : '50px', 
                            position : 'relative' 
                        }}
                    >
                        <Tooltip title={'Close'}>
                            <IconButton 
                                onClick={this.props.closeCallback} 
                                style={{ position : 'absolute', right : '8px', top : '8px' }}
                            >
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
            const nodes: ElementsDefinition['nodes'] = relevantConcepts.map(Concept => {
                let mastery: number = this.props.lessons.filter(AvoLesson => AvoLesson.conceptID === Concept.conceptID)[0].mastery;
                relevantConceptIds.push(Concept.conceptID);
                return ({
                    data: {
                        id: `node-${Concept.conceptID}-end`, // the + '-end' is for later on filtering
                        mastery: mastery * 100
                    },
                    style: {
                        content:
                            Concept.name.length > 28
                                ? Concept.name.substring(0, 25) + '...'
                                : Concept.name,
                    },
                });
            });
            const edges: any = this.props.edges // Element definition breaks this, so im using any here to prevent that from happening, hope thats cool
                .filter(Edge => !!~relevantConceptIds.indexOf(Edge.child) && !!~relevantConceptIds.indexOf(Edge.parent))    
                .map(Edge => ({ 
                        data: {
                            source: `node-${Edge.parent}-end`,
                            target: `node-${Edge.child}-end`,
                            id: `between-${Edge.parent}-${Edge.child}`,
                        },
                    })
                );
    
            cytoscape.use(dagre);
            (window as any).cy = cytoscape({
                container: document.getElementById('cy'),
                boxSelectionEnabled: false,
                autounselectify: true,
                layout: {
                    name: 'dagre',
                    spacingFactor: 1.25,
                },
                style: [
                    {
                        selector: 'node',
                        style: {
                            'background-image'   : (data : any) => 'url(data:image/svg+xml;base64,' + this.getIcon(data) + ')', // I know, I know, don't use any, just let this one fly
                            'width'              : '250px',
                            'height'             : '250px',
                            'text-valign'        : 'center',
                            'text-halign'        : 'right',
                            'color'              : this.props.theme.theme == 'light' ? 'black' : 'white',
                            'background-opacity' : 0,
                            'background-fit'     : 'cover',
                            'background-clip'    : 'node',
                        } as any,
                    },
                    {
                        selector: 'edge',
                        style: {
                            width: 4,
                            'target-arrow-shape': 'triangle',
                            'line-color': this.props.theme.color[500],
                            'target-arrow-color': this.props.theme.color[500],
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

    getIcon(data: any) {
        const mastery = data._private.data.mastery;
        return btoa(`
            <svg fill='` + "red" + `' width='` + 250 + `' height='` + 250 + `' viewBox="` + 0 + ` ` + 0 + ` ` + 42 + ` ` + 42 + `"   xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="shadow">
                        <feDropShadow dx="0.1" dy="0.4" stdDeviation="1"/>
                    </filter>
                </defs>
                <circle class="donut-ring" cx="21" cy="21" r="16" fill="transparent" stroke="#fafafa" stroke-width="0.25" stroke-dasharray="0.5"></circle>
                <circle class="avo-progression-gauge-svg" cx="21" cy="21" r="16" fill="transparent" stroke="${this.props.theme.color[500]}" stroke-width="0.85" stroke-dasharray="${mastery} ${100 - mastery}" stroke-dashoffset="25" stroke-linecap="round"></circle>
                <circle r="12" cx="21" cy="21" fill="${this.props.theme.theme === 'dark' ? 'rgb(48, 48, 48)' : '#fff'}" style="filter:url(#shadow);"></circle>
                <text x="21" y="25" fill="lightslategrey" text-anchor="middle" font-family="Arial" style="font-size: 3px;">Mastery</text>
                <text x="21" y="20.5" fill="${this.props.theme.color[500]}" text-anchor="middle" font-family="Arial" style="font-size: 4px;">${mastery}%</text>
            </svg>
        `);
    }
};