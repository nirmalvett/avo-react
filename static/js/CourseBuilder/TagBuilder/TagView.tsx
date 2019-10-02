import React, {Component} from 'react';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import TreeView from './TreeView';
import FolderView from './FolderView';
import Select from '@material-ui/core/Select';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import * as Http from '../../Http';
import {Class} from '../../Models';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ExpandMore from '@material-ui/icons/ExpandMore';
import {
    Edit, Info, Add, Fullscreen
} from '@material-ui/icons';
import {
    FormControl,
    IconButton,
    Input,
    InputAdornment,
    InputLabel,
    Typography
} from '@material-ui/core';

interface Concept {
    conceptID: number;
    name: string;
    lesson: string;
};

interface Edge {
    child: number;
    parent: number;
    weight: number;
};

interface TagViewProps {
    theme: {
        color: {
            '100': string;
            '200': string;
            '500': string;
        };
        theme: 'light' | 'dark';
    };
}

interface TagViewState {
    currentView: string;
    selectedClassName: string;
    classNames: string[];
    classes: Class[];
    selectedClass: Class;
    loadingClasses: boolean;

    editingTagName: boolean;
    tagName: string;

    showParentNodes: boolean;
    showChildNodes: boolean;

    selectedConcept: Concept;
    concepts: Concept[];
    edges: Edge[];    

    nodesLoaded: boolean;
}

const nodeData = {
    concepts: [
        {
            conceptID: 1,
            name: "Concept1 Parent",
            lesson: "Lesson String"
        },
        {
            conceptID: 2,
            name: "Concept2",
            lesson: "Lesson String"
        },
        {
            conceptID: 3,
            name: "Concept3",
            lesson: "Lesson String"
        },
        {
            conceptID: 6,
            name: "Concept3.1",
            lesson: "Lesson String"
        },
        {
            conceptID: 4,
            name: "Concept4",
            lesson: "Lesson String"
        },
        {
            conceptID: 5,
            name: "Concept5",
            lesson: "Lesson String"
        },
    ],
    edges: [
        {
            parent: 1, 
            child: 2,
            weight: 0.94
        },
        {
            parent: 1, 
            child: 3,
            weight: 0.29
        },
        {
            parent: 3, 
            child: 4,
            weight: 0.59
        },
        {
            parent: 6, 
            child: 4,
            weight: 0.59
        },
    
    ]
};

export default class TagView extends Component<TagViewProps, TagViewState> {
    constructor(props: TagViewProps) {
        super(props);
        this.state = {
            currentView: 'tagTreeView',
            selectedClassName: 'Select class...',
            classNames: [],
            classes: [],
            selectedClass: {} as Class,
            loadingClasses: true,

            selectedConcept: {} as Tag,
            editingTagName: false,

            showParentNodes: false,
            showChildNodes: false,
            tagName: '',

            concepts: [],
            edges: [],
            
            nodesLoaded: false
        };
    }
    componentDidMount() {
        this.getClasses();
    }

    render() {
        const { showChildNodes, showParentNodes } = this.state;
        return (
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    margin: 25,
                }}
            >
                {this.state.loadingClasses && <div className='avo-loading-icon'></div>}
                {!this.state.loadingClasses && (
                    <Card
                        style={{
                            width: '100%',
                            margin: 0,
                            padding: 0,
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                    >
                        <Grid container spacing={8} style={{ height: '-webkit-fill-available' }}>
                            <Grid item md={8}>
                                {this.state.nodesLoaded && <TreeView theme={this.props.theme} concepts={this.state.concepts} edges={this.state.edges} setTagIndex={this.setTagIndex.bind(this)}/> }
                            </Grid>
                            <Grid item md={4}>
                                <div style={{display: 'flex', flexDirection: 'row'}}>
                                    <div>
                                        <Select
                                            value={this.state.selectedClassName}
                                            input={<Input name='data' id='select-class' />}
                                            onChange={e =>
                                                this.setState(
                                                    {selectedClassName: e.target.value as string},
                                                    () => this.changeClass(),
                                                )
                                            }
                                        >
                                            {this.state.classNames.map((c: any, i: number) => (
                                                <MenuItem key={i} value={c}>
                                                    {c}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        <FormControl>
                                            <Input
                                                id='edit-concept'
                                                value={this.state.tagName}
                                                disabled={!this.state.editingTagName}
                                                onChange={e => this.setState({tagName: e.target.value})}
                                                endAdornment={
                                                    <InputAdornment position='end'>
                                                        <IconButton style={{top: -8}} onClick={() => this.setState({ editingTagName : !this.state.editingTagName })}>
                                                            <Edit />
                                                        </IconButton>
                                                    </InputAdornment>
                                                }
                                            />
                                        </FormControl>
                                        <br/>
                                        <List
                                            component="nav"
                                            style={{ maxHeight : '60vh' }}
                                            aria-labelledby="nested-list-subheader"
                                            subheader={
                                                <ListSubheader component="div" id="nested-list-subheader">
                                                    Related Concepts & Weights <Info/>
                                                </ListSubheader>
                                            }
                                        >
                                            <ListItem button onClick={() => this.setState({ showParentNodes : !showParentNodes })}>
                                                <ListItemText primary="Prerequisite Concepts" />
                                                {showParentNodes ? <ExpandLess /> : <ExpandMore />}
                                                <ListItemSecondaryAction>
                                                    <IconButton edge="end" aria-label="Add">
                                                      <Add />
                                                    </IconButton>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                            <Collapse in={showParentNodes} timeout="auto" unmountOnExit>
                                                <List component="div" disablePadding>
                                                    {!!this.state.selectedConcept && this.getParentNodes(this.state.selectedConcept.conceptID).map(parent => (
                                                        <ListItem button>
                                                            <ListItemText primary={parent.name} />
                                                            <ListItemSecondaryAction>
                                                                <Typography component={'span'} variant="body2" gutterBottom>
                                                                    W:{parent.weight}
                                                                </Typography>
                                                                <IconButton edge="end" aria-label="Edit">
                                                                    <Edit />
                                                                </IconButton>
                                                                <IconButton edge="end" aria-label="Edit">
                                                                    <Fullscreen />
                                                                </IconButton>
                                                            </ListItemSecondaryAction>
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </Collapse>
                                            <ListItem button onClick={() => this.setState({ showChildNodes : !showChildNodes })}>
                                                <ListItemText primary="Subsequent Concepts" />
                                                {showChildNodes ? <ExpandLess /> : <ExpandMore />}
                                                 <ListItemSecondaryAction>
                                                    <IconButton edge="end" aria-label="Add">
                                                      <Add />
                                                    </IconButton>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                            <Collapse in={showChildNodes} timeout="auto" unmountOnExit>
                                                <List component="div" disablePadding>
                                                    {!!this.state.selectedConcept && this.getChildNodes(this.state.selectedConcept.conceptID).map(child => (
                                                        <ListItem button>
                                                            <ListItemText primary={child.name} />
                                                            <ListItemSecondaryAction>
                                                                <Typography component={'span'} variant="body2" gutterBottom>
                                                                    W:{child.weight}
                                                                </Typography>
                                                                <IconButton edge="end" aria-label="Edit">
                                                                    <Edit />
                                                                </IconButton>
                                                                <IconButton edge="end" aria-label="Edit">
                                                                    <Fullscreen />
                                                                </IconButton>
                                                            </ListItemSecondaryAction>
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </Collapse>
                                        </List>
                                    </div>
                                </div>
                            </Grid>
                        </Grid>
                    </Card>
                )}
            </div>
        );
    }
   
    getClasses() {
        Http.getClasses(
            res => {
                console.log(res);
                const classes = res.classes;
                if (classes.length > 0) {
                    this.setState(
                        {
                            classNames: classes.map(c => c.name),
                            classes,
                            selectedClass: classes[0],
                            selectedClassName: classes[0].name,
                            loadingClasses: false,
                        },
                        () => this.changeClass(),
                    );
                }
            },
            err => {
                console.log(err);
            },
        );
    }

    getParentNodes(id: number) {
        const parentNodes = [];
        const conceptMapByID = {};
        this.state.concepts.forEach(Concept => conceptMapByID[Concept.conceptID] = Concept );
        this.state.edges.forEach(Edge => {
            if(Edge.child === id) {
                const Node = conceptMapByID[Edge.parent];
                Node.weight = Edge.weight;
                parentNodes.push(Node);                    
            }
        });
        return parentNodes;
    };

    getChildNodes(id: number) {
        const childNodes = [];
        const conceptMapByID = {};
        this.state.concepts.forEach(Concept => conceptMapByID[Concept.conceptID] = Concept );
        this.state.edges.forEach(Edge => {
            if(Edge.parent == id) {
                const Node = conceptMapByID[Edge.child];
                Node.weight = Edge.weight;
                childNodes.push(Node);                    
            }
        });
        return childNodes;
    };

    setTagIndex(index: number) {
        console.log(index);
        const selectedConcept = this.state.concepts[index];
        this.setState({ 
            selectedConcept : selectedConcept,
            tagName         : selectedConcept.name
        });
    };

    getSelectedNode() {

    };

    getTagNodes = () => {
        Http.getTags(
            this.state.selectedClass.classID,
            res => {
                // const data = res.tags;
                this.setState({
                    // tagNodes : data,
                    concepts: nodeData.concepts,
                    edges: nodeData.edges,
                    nodesLoaded : true
                });
            },
            console.warn,
        ); 
    };

    changeClass = () => {
        const {selectedClassName, classes} = this.state;
        if (selectedClassName !== 'Select class...') {
            const selectedClass = classes.find((c: Class) => c.name === selectedClassName);
            if (selectedClass) {
                this.setState({selectedClass});
                this.getTagNodes();
            }
        }
    };
}
