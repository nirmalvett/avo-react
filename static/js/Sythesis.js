import React, {Component} from 'react';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
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
import cytoscape from 'cytoscape';
import Http from './HelperFunctions/Http';
import dagre from 'cytoscape-dagre';
import {getMathJax} from "./HelperFunctions/Utilities";

cytoscape.use(dagre);

export default class Sythesis extends Component {

	constructor(props = {}) {
		super(props);

		this.state = {
			selectedStartState: 'Scenerio#0',
			selectedEndState: 'Scenerio#0',
			selectedScenario: '',
			cy: {},
			cyLoaded: undefined,
			currentState: '',
			scenerios: [],
			nodes: [],
			latexProof: "",
		};
	};

	render() {
		return (
				<div className='avo-user__background' style={{width: '100%', flex: 1, display: 'flex'}}>
					<Grid container spacing={8} style={{flex: 1, display: 'flex', paddingBottom: 0}}>
						<Grid item xs={3} style={{flex: 1, display: 'flex'}}>
							{this.sideMenu()}
						</Grid>
						<Grid item xs={1}/>
						<Grid item xs={7} style={{display: 'flex'}}>
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
				<Paper classes={{root: 'avo-sidebar'}} square style={{width: '100%', flex: 1, display: 'flex'}}>
					<List style={{flex: 1, overflowY: 'auto', marginTop: '5px', marginBottom: '5px'}}>
						<Typography component={'span'} variant='subheading' color="textPrimary" align='center'>
							Welcome to Synthesis
						</Typography>
						<br/>
						<Divider/>
						<ListSubheader style={{position: 'relative'}}>Select States</ListSubheader>
						{this.state.scenerios.map((obj) => (
										<ListItem
												button
												selected={obj == this.state.selectedScenario}
												classes={{root: 'avo-menu__item', selected: 'selected'}}
												onClick={() => {
													this.loadInGraph(obj);
												}
												}>
											{obj}
										</ListItem>
								)
						)}
					</List>
				</Paper>
		);
	};

	detailsCard() {
		if (this.state.cyLoaded === undefined) {
			return (
					<React.Fragment>
						<CardHeader
								classes={{
									root: 'avo-card__header'
								}}
								title={'Please select a Scenerio'}
						/>
						<div style={{'padding': '8px'}}>
							<div>
								<Typography component={'span'} variant='body1' color='textPrimary'>
									No Scenario selected.
								</Typography>
							</div>
						</div>
					</React.Fragment>
			);
		}
		return (
				<React.Fragment>
					<CardHeader
							classes={{
								root: 'avo-card__header'
							}}
							title={'Scenario'}
					/>
					<div style={{'padding': '8px'}}>
                    <span>
                        <span>
                            <b>Starting Matrix: </b>
                        </span>
                        <span style={{marginLeft: '1.0em', marginRight: '1.0em'}}>
                            <FormControl>
                                <Select
		                                value={this.state.selectedStartState}
		                                onChange={(evt) => this.setState({selectedStartState: evt.target.value})}
		                                input={<Input name="dataSelected"/>}
                                >
                                    <MenuItem value={'Scenerio#0'} key={'Scenerio#0'}>None</MenuItem>
	                                {this.state.nodes.filter((obj) => {
		                                return !obj.data.parent;
	                                }).map((obj) => {
		                                return <MenuItem value={obj.data.title}
		                                                 key={obj.data.title}>{obj.data.title}</MenuItem>;
	                                })}
                                </Select>
                            </FormControl>
                        </span>
                        <span>
                            <b>End State: </b>
                        </span>
                        <span style={{marginLeft: '1.0em', marginRight: '1.0em'}}>
                            <FormControl>
                                <Select
		                                value={this.state.selectedEndState}
		                                onChange={(evt) => this.setState({selectedEndState: evt.target.value})}
		                                input={<Input name="dataSelected"/>}
                                >
                                    <MenuItem value={'Scenerio#0'} key={'Scenerio#01'}>None</MenuItem>
	                                {this.state.nodes.filter((obj) => {
		                                return !!obj.data.parent;
	                                }).map((obj) => {
		                                const name = obj.data.id.split('$');
		                                return <MenuItem value={obj.data.id}
		                                                 key={obj.data.id}>{name[0]}, {name[1]}</MenuItem>;
	                                })}
                                </Select>
                            </FormControl>
                        </span>
                    </span>
						<span>
                          <Button
		                          color='primary'
		                          classes={{
			                          root: 'avo-button',
			                          disabled: 'disabled'
		                          }}
		                          className=""
		                          onClick={() => this.getPath()}>
                            Get Transversal
                        </Button>
                    </span>
						<div id="cy" style={{'height': '20em', 'width': '100%'}}></div>
						<div style = {{overflow: 'auto'}}>
							<Typography component={'span'} variant='body1' color='textPrimary'>
								<b>Description: </b>
								<br/>
							</Typography>
								{
									this.state.latexProof === "" && this.state.latexProof !== undefined
											? "A description will be given here when valid inputs are selected."
											: getMathJax(addNewLines(this.state.latexProof))
								}
							<br/><br/><br/>
						</div>
					</div>
				</React.Fragment>
		);
	};



	loadScenerios() {
		Http.synthesisScenarios(
				(result) => {
					console.log(result);
					this.setState({scenerios: result.scanerios});
				},
				(result) => {
					console.log(result);
				}
		)
	};

	getPath() {
		console.log(
				this.state.selectedScenario,
				this.state.selectedStartState,
				this.state.selectedEndState.split('$')[0],
				this.state.selectedEndState.split('$')[1]
		);
		Http.synthesisGetTransversal(
				this.state.selectedScenario,
				this.state.selectedStartState,
				this.state.selectedEndState.split('$')[0],
				this.state.selectedEndState.split('$')[1],
				(result) => {
					this.setState({latexProof: result.latexProof});
					console.log(result.graph);
					this.state.cy.filter('node').filter((obj) => {
						if (obj.data('parent')) obj.style({'background-color': '#399103'});
						return result.graph.indexOf(obj.data('id')) !== -1;
					}).forEach((obj) => {
						console.log(obj.data('id'));
						obj.style({'background-color': '#ff0'});
					});
				},
				(result) => {
					console.log(result);
				}
		);
	};

	loadInGraph(id) {
		this.setState({cyLoaded: true});
		Http.synthesisPreviewScenario(
				id,
				(result) => {
					console.log(result);
					const parents = {};
					let nodes = result.graph.graph.nodes;
					let edges = result.graph.graph.edges;
					nodes.forEach((obj) => {
						if (!!obj.data.parent && !parents[obj.data.parent]) parents[obj.data.parent] = obj.data.parent;
					});
					for (let key in parents) {
						nodes.push({data: {id: parents[key], title: parents[key]}});
					}
					;
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
									'content': 'data(title)',
									'background-color': '#399103'
								}
							},
							{
								selector: '$node > node',
								style: {
									'shape': 'roundrect',
									'padding-top': '10px',
									'padding-left': '10px',
									'padding-bottom': '10px',
									'padding-right': '10px',
									'border-color': '#399103',
									'border-width': '1',
									'text-valign': 'top',
									'text-halign': 'center',
									'background-color': '#fff'
								}
							},
							{
								selector: 'edge',
								style: {
									'width': 4,
									'target-arrow-shape': 'triangle',
									'line-color': '#f8ee7b',
									'target-arrow-color': '#f8ee7b',
									'curve-style': 'bezier'
								}
							}
						],
						elements: {
							nodes: nodes,
							edges: edges
						}
					});
					this.setState({cy: cy, nodes: nodes, selectedScenario: id});
				},
				(result) => {
					console.log(result);
				}
		);
	};

	componentDidMount() {
		this.loadScenerios();
	};


};
function addNewLines(inputArray){
	let returnString = "";
	for (let i = 0; i < inputArray.length; i++){
		returnString += inputArray[i] + "$\\\\$"
	}
	return returnString;
}
