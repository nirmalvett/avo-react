import React, { Component } from "react";
// import * as cytoscape from 'cytoscape'
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import Http from "../../HelperFunctions/Http";
export default class TreeView extends React.Component<any, any> {
    constructor(props) {
        super(props)
        this.getTags()
    }
    render() {
        return <div id="cy" style={{ width: 800, height: 790 }}></div>
    }
    getTags() {
        Http.getTags(
            res => {
                setTimeout(() => {
                    const data = res.tags;
                    var nodes = [];
                    var edges = [];

                    data.forEach(function (el) {
                        nodes.push({
                            data: {
                                id: 'node-' + el.TAG,
                            },
                            style: {
                                content: el.tagName.length > 10 ? el.tagName.substring(0, 15) + '...' : el.tagName
                            }
                        });
                        if (el.parent !== null) {
                            edges.push({ data: { target: 'node-' + el.TAG, source: 'node-' + el.parent } });
                        }
                    });
                    cytoscape.use(dagre);
                    (window as any).cy = cytoscape({
                        container: document.getElementById('cy'),
                        boxSelectionEnabled: false,
                        autounselectify: true,
                        layout: {
                            name: 'dagre',
                            spacingFactor: 2
                        },
                        style: [
                            {
                                selector: 'node',
                                style: {
                                    'background-color': '#11479e'
                                }
                            },
                            {
                                selector: 'edge',
                                style: {
                                    'width': 4,
                                    'target-arrow-shape': 'triangle',
                                    'line-color': '#9dbaea',
                                    'target-arrow-color': '#9dbaea',
                                    'curve-style': 'bezier'
                                }
                            }
                        ],
                        elements: {
                            nodes: nodes,
                            edges: edges
                            // nodes: [
                            // { data: { id: 'n0' } },
                            // { data: { id: 'n1' } },
                            // { data: { id: 'n2' } },
                            // { data: { id: 'n3' } },
                            // { data: { id: 'n4' } },
                            // { data: { id: 'n5' } },
                            // { data: { id: 'n6' } },
                            // { data: { id: 'n7' } },
                            // { data: { id: 'n8' } },
                            // { data: { id: 'n9' } },
                            // { data: { id: 'n10' } },
                            // { data: { id: 'n11' } },
                            // { data: { id: 'n12' } },
                            // { data: { id: 'n13' } },
                            // { data: { id: 'n14' } },
                            // { data: { id: 'n15' } },
                            // { data: { id: 'n16' } }
                            // ],
                            // edges: [
                            // { data: { source: 'n0', target: 'n1' } },
                            // { data: { source: 'n1', target: 'n2' } },
                            // { data: { source: 'n1', target: 'n3' } },
                            // { data: { source: 'n4', target: 'n5' } },
                            // { data: { source: 'n4', target: 'n6' } },
                            // { data: { source: 'n6', target: 'n7' } },
                            // { data: { source: 'n6', target: 'n8' } },
                            // { data: { source: 'n8', target: 'n9' } },
                            // { data: { source: 'n8', target: 'n10' } },
                            // { data: { source: 'n11', target: 'n12' } },
                            // { data: { source: 'n12', target: 'n13' } },
                            // { data: { source: 'n13', target: 'n14' } },
                            // { data: { source: 'n13', target: 'n15' } },
                            // ]
                        }
                    });
                }, 1);
            },
            err => {
                console.log(err);
            }
        );
    }
}