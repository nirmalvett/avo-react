import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import Collapse from '@material-ui/core/Collapse';
import ListItem from '@material-ui/core/ListItem';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

let cytoscape = require('cytoscape');
let dagre = require('cytoscape-dagre');

cytoscape.use(dagre); // register extension

export default class Sythesis extends Component {

    constructor(props = {}) {
        super(props);
    };

    render() {
        return (
            <div className='avo-user__background' style={{ width: '100%', flex: 1, display: 'flex' }}>
                <Grid container spacing={8} style={{ flex: 1, display: 'flex', paddingBottom: 0 }}>
                    <Grid item xs={3} style={{ flex: 1, display: 'flex' }}>
                        {/* {this.sideMenu()} */}
                    </Grid>
                    <Grid item xs={1} />
                    <Grid item xs={7} style={{ display: 'flex' }}>
                        <Card
                            className='avo-card'
                            style={{
                                marginBottom: '10%',
                                padding: '10px',
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            {this.detailsCard()}
                        </Card>
                    </Grid>
                </Grid>
            </div>
        );
    };

    sideMenu() {
        return (
            <Paper classes={{ root: 'avo-sidebar' }} square style={{ width: '100%', flex: 1, display: 'flex' }}>
                <List style={{ flex: 1, overflowY: 'auto', marginTop: '5px', marginBottom: '5px' }}>
                    <Typography component={'span'} variant='subheading' color="textPrimary" align='center'>
                        Welcome to Sythesis
					</Typography>
                    <br />
                    <Divider />
                    <ListSubheader style={{ position: 'relative' }}>Select States</ListSubheader>

                </List>
            </Paper>
        );
    };

    detailsCard() {
        return (
            <React.Fragment>
                <CardHeader
                    classes={{
                        root: 'avo-card__header'
                    }}
                    title={'Selected State'}
                />
                <div id="cy"></div>
            </React.Fragment>
        );
    };

    componentDidMount() {
        window.addEventListener('DOMContentLoaded', function () {
            var cy = window.cy = cytoscape({
                container: document.getElementById('cy'),
                boxSelectionEnabled: false,
                autounselectify: true,
                layout: {
                    name: 'dagre'
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
                    nodes: [
                        { data: { id: 'n0' } },
                        { data: { id: 'n1' } },
                        { data: { id: 'n2' } },
                        { data: { id: 'n3' } },
                        { data: { id: 'n4' } },
                        { data: { id: 'n5' } },
                        { data: { id: 'n6' } },
                        { data: { id: 'n7' } },
                        { data: { id: 'n8' } },
                        { data: { id: 'n9' } },
                        { data: { id: 'n10' } },
                        { data: { id: 'n11' } },
                        { data: { id: 'n12' } },
                        { data: { id: 'n13' } },
                        { data: { id: 'n14' } },
                        { data: { id: 'n15' } },
                        { data: { id: 'n16' } }
                    ],
                    edges: [
                        { data: { source: 'n0', target: 'n1' } },
                        { data: { source: 'n1', target: 'n2' } },
                        { data: { source: 'n1', target: 'n3' } },
                        { data: { source: 'n4', target: 'n5' } },
                        { data: { source: 'n4', target: 'n6' } },
                        { data: { source: 'n6', target: 'n7' } },
                        { data: { source: 'n6', target: 'n8' } },
                        { data: { source: 'n8', target: 'n9' } },
                        { data: { source: 'n8', target: 'n10' } },
                        { data: { source: 'n11', target: 'n12' } },
                        { data: { source: 'n12', target: 'n13' } },
                        { data: { source: 'n13', target: 'n14' } },
                        { data: { source: 'n13', target: 'n15' } },
                    ]
                }
            });
        });
    };

    getElements() {
        return {
            nodes: [
                { data: { id: 'n0' } },
                { data: { id: 'n1' } },
                { data: { id: 'n2' } },
                { data: { id: 'n3' } },
                { data: { id: 'n4' } },
                { data: { id: 'n5' } },
                { data: { id: 'n6' } },
                { data: { id: 'n7' } },
                { data: { id: 'n8' } },
                { data: { id: 'n9' } },
                { data: { id: 'n10' } },
                { data: { id: 'n11' } },
                { data: { id: 'n12' } },
                { data: { id: 'n13' } },
                { data: { id: 'n14' } },
                { data: { id: 'n15' } },
                { data: { id: 'n16' } }
            ],
            edges: [
                { data: { source: 'n0', target: 'n1' } },
                { data: { source: 'n1', target: 'n2' } },
                { data: { source: 'n1', target: 'n3' } },
                { data: { source: 'n4', target: 'n5' } },
                { data: { source: 'n4', target: 'n6' } },
                { data: { source: 'n6', target: 'n7' } },
                { data: { source: 'n6', target: 'n8' } },
                { data: { source: 'n8', target: 'n9' } },
                { data: { source: 'n8', target: 'n10' } },
                { data: { source: 'n11', target: 'n12' } },
                { data: { source: 'n12', target: 'n13' } },
                { data: { source: 'n13', target: 'n14' } },
                { data: { source: 'n13', target: 'n15' } },
            ]
        };
    };

};