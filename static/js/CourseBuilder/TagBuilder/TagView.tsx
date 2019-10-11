import React, {Component} from 'react';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import TreeView from './TreeView';
import Select from '@material-ui/core/Select';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import * as Http from '../../Http';
import {getMathJax} from '../../HelperFunctions/Utilities';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ExpandMore from '@material-ui/icons/ExpandMore';
import debounce from '../../SharedComponents/AVODebouncer';
import Modal from '@material-ui/core/Modal';
import AVOPopupMenu from '../../SharedComponents/AVOPopupMenu';
import {
    Edit, Add, Fullscreen, Save, Close 
} from '@material-ui/icons';
import {
    FormControl,
    IconButton,
    Input,
    InputAdornment,
    TextField,
    Fab,
    Fade,
    Paper,
    Typography
} from '@material-ui/core';
import {GetSections_Section} from "../../Http";

interface Concept {
    conceptID: number;
    name: string;
    lesson: string;
}

interface WeightedConcept {
    conceptID: number;
    name: string;
    lesson: string;
    weight: number;
}

interface Edge {
    child: number;
    parent: number;
    weight: number;
}

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
    classes: GetSections_Section[];
    selectedClass: GetSections_Section;
    loadingClasses: boolean;

    editingTagName: boolean;
    tagName: string;

    lessonText: string;
    isEditingLesson: boolean;

    showParentNodes: boolean;
    showChildNodes: boolean;

    selectedConcept: Concept;
    concepts: Concept[];
    edges: Edge[];    

    showModal: boolean;
    showAddNodeModal: boolean;
    showAddRelatedNodeModal: boolean;
    modalNode: WeightedConcept;

    nodesLoaded: boolean;
}

const nodeData = {
    concepts: [
        {
            conceptID: 1,
            name: "Concept1 Parent also this is a really long string wooot",
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
    chartRef: {current: TreeView};
    newConceptNameRef: React.RefObject<{}>;
    newConceptLessonRef: React.RefObject<{}>;
    newRelationWeightRef: React.RefObject<{}>;
    constructor(props: TagViewProps) {
        super(props);
        this.state = {
            currentView: 'tagTreeView',
            selectedClassName: 'Select class...',
            classNames: [],
            classes: [],
            selectedClass: {} as GetSections_Section,
            loadingClasses: true,

            selectedConcept: {} as Concept,
            editingTagName: false,

            showParentNodes: false,
            showChildNodes: false,
            tagName: '',

            lessonText: '',
            isEditingLesson: false,

            concepts: [],
            edges: [],

            showModal: false,
            showAddNodeModal: false,
            showAddRelatedNodeModal: false,
            modalNode: {} as WeightedConcept,
            
            nodesLoaded: false
        };
        this.chartRef = React.createRef() as {current: TreeView};
        this.newConceptNameRef = React.createRef();
        this.newConceptLessonRef = React.createRef();
        this.newRelationWeightRef = React.createRef();
    }

    componentDidMount() {
        this.getClasses();
    }

    render() {
        const { showChildNodes, showParentNodes } = this.state;
        const lessonChangeDebouncer = debounce({
            callback : (e : any) => {
                console.log('I was called woot', e.target.value);
                this.setState({ lessonText : e.target.value });
            },
            wait : 1000,
            immediate : false
        });
        return (
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    margin: 25,
                }}
            >
                {this.state.loadingClasses && <div className='avo-loading-icon'/>}
                {this.state.isEditingLesson && (
                    <Fade in={this.state.isEditingLesson}>
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
                            <IconButton onClick={() => this.setState({ isEditingLesson : false }) } aria-label="add" style={{ position : 'absolute', bottom : '24px', right : '24px' }}>
                                <Save/>
                            </IconButton>
                            <Grid container spacing={8} style={{ height : '60vh', position : 'relative' }}>
                                <Grid item md={6}>
                                    <TextField
                                        label="Lesson Content"
                                        margin="dense"
                                        variant="outlined"
                                        multiline
                                        defaultValue={this.state.lessonText}
                                        onChange={(e: any) => { e.persist(); console.log(e); lessonChangeDebouncer(e); }}
                                        style={{ height : '-webkit-fill-available', width : '-webkit-fill-available' }}
                                        rowsMax="12"
                                    />
                                </Grid>
                                <Grid item md={6}>
                                        {getMathJax(
                                            this.state.lessonText,
                                            'body2',
                                            `Lesson_latex_viwe`,
                                        )}
                                </Grid>
                            </Grid>
                        </Card>
                    </Fade>
                )}
                {(!this.state.loadingClasses && !this.state.isEditingLesson) && (
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
                                {this.state.nodesLoaded && <TreeView ref={this.chartRef} theme={this.props.theme} concepts={this.state.concepts} edges={this.state.edges} setTagIndex={this.setTagIndex.bind(this)}/> }
                            </Grid>
                            <Grid item md={4}>
                                <div style={{display: 'flex', flexDirection: 'row', position: 'relative', height: '-webkit-fill-available' }}>
                                    <Fab color="primary" aria-label="add" style={{ position : 'absolute', bottom : '9px', right : '9px' }}>
                                        <Save/>
                                    </Fab>
                                    <div style={{ position : 'absolute', top : '9px', right : '9px' }}>
                                        <AVOPopupMenu options={[ 
                                            { label : 'Edit Lesson', onClick : () => { this.setState({ isEditingLesson : true }); } }, 
                                            { label : 'Add Node', onClick : () => { this.setState({ showAddNodeModal : true }); } } 
                                        ]}/>
                                    </div>
                                    <div style={{ width: '-webkit-fill-available', marginTop : '9px' }}>
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
                                        <br/>
                                        <br/>
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
                                                    Related Concepts & Weights 
                                                    {/* <span>
                                                        <AVOPopover content={'This is some popover content'}>
                                                            <Info style={{ transform : 'scale(0.75) translateY(10px)' }}/>
                                                        </AVOPopover>
                                                    </span> */}
                                                </ListSubheader>
                                            }
                                        >
                                            <ListItem button onClick={() => this.setState({ showParentNodes : !showParentNodes })}>
                                                <ListItemText primary={<b>Prerequisite Concepts</b>} />
                                                {showParentNodes ? <ExpandLess /> : <ExpandMore />}
                                                <ListItemSecondaryAction>
                                                    <IconButton edge="end" aria-label="Add" onClick={() => this.setState({ showAddRelatedNodeModal : true })}>
                                                      <Add />
                                                    </IconButton>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                            <Collapse in={showParentNodes} timeout="auto" unmountOnExit>
                                                <List component="div" disablePadding>
                                                    {!!this.state.selectedConcept && this.getParentNodes(this.state.selectedConcept.conceptID).map(WeightedConcept => (
                                                        <ListItem button>
                                                            <ListItemText primary={WeightedConcept.name} />
                                                            <ListItemSecondaryAction>
                                                                <Typography component={'span'} variant="body2" gutterBottom>
                                                                    W:{WeightedConcept.weight}
                                                                </Typography>
                                                                <IconButton edge="end" aria-label="Edit" onClick={() => this.openWeightModal(WeightedConcept)}>
                                                                    <Edit />
                                                                </IconButton>
                                                                <IconButton edge="end" aria-label="Go To" onClick={() => this.gotoSelectedNode(WeightedConcept)}>
                                                                    <Fullscreen />
                                                                </IconButton>
                                                            </ListItemSecondaryAction>
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </Collapse>
                                            <ListItem button onClick={() => this.setState({ showChildNodes : !showChildNodes })}>
                                                <ListItemText primary={<b>Subsequent Concepts</b>} />
                                                {showChildNodes ? <ExpandLess /> : <ExpandMore />}
                                                 <ListItemSecondaryAction>
                                                    <IconButton edge="end" aria-label="Add" onClick={() => this.setState({ showAddRelatedNodeModal : true })}>
                                                      <Add />
                                                    </IconButton>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                            <Collapse in={showChildNodes} timeout="auto" unmountOnExit>
                                                <List component="div" disablePadding>
                                                    {!!this.state.selectedConcept && this.getChildNodes(this.state.selectedConcept.conceptID).map(WeightedConcept => (
                                                        <ListItem button>
                                                            <ListItemText primary={WeightedConcept.name} />
                                                            <ListItemSecondaryAction>
                                                                <Typography component={'span'} variant="body2" gutterBottom>
                                                                    W:{WeightedConcept.weight}
                                                                </Typography>
                                                                <IconButton edge="end" aria-label="Edit" onClick={() => this.openWeightModal(WeightedConcept)}>
                                                                    <Edit />
                                                                </IconButton>
                                                                <IconButton edge="end" aria-label="Go To" onClick={() => this.gotoSelectedNode(WeightedConcept)}>
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
                <Modal
                    open={this.state.showModal}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                    style={{ width : '40%', top : '50px', left: '30%', right : '30%', position : 'absolute' }}
                >
                    <Paper className="avo-card">
                        <IconButton style={{ position : 'absolute', right : '9px', top : '9px' }} onClick={() => this.setState({ showModal : false })}>
                            <Close/>
                        </IconButton>
                        <Typography variant={'h5'} id="modal-title">
                            Weight of relationship between: 
                            <br/>
                            {this.state.selectedConcept.name} and {this.state.modalNode.name}
                        </Typography>
                        <br/>
                        <Typography variant={'body1'} id="modal-description">
                            Current Weight is: {this.state.modalNode.weight}
                            <br/>
                            <Select
                                value={this.state.selectedClassName}
                                input={<Input name='data' id='select-class' />}
                                onChange={e =>{
                                    const newWeight:number = parseInt(e.target.value);
                                    
                                }}
                            >
                                <MenuItem key={'relation-weight-1'} value={'1'}>
                                    1
                                </MenuItem>
                                <MenuItem key={'relation-weight-2'} value={'2'}>
                                    2
                                </MenuItem>
                                <MenuItem key={'relation-weight-3'} value={'3'}>
                                    3
                                </MenuItem>
                                <MenuItem key={'relation-weight-4'} value={'4'}>
                                    4
                                </MenuItem>
                            </Select>                      
                        </Typography>
                    </Paper>
                </Modal>
                <Modal
                    open={this.state.showAddNodeModal}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                    style={{ width : '40%', top : '50px', left: '30%', right : '30%', position : 'absolute' }}
                >
                    <Paper className="avo-card">
                        <IconButton style={{ position : 'absolute', right : '9px', top : '9px' }} onClick={() => this.setState({ showAddNodeModal : false })}>
                            <Close/>
                        </IconButton>
                        <Typography variant={'h5'} id="modal-title">
                            Add New Concept
                        </Typography>
                        <br/>
                        <Typography variant={'body1'} id="modal-description">
                            <FormControl>
                                <Input
                                    id='set-new__node-name'
                                    ref={this.newConceptNameRef}
                                    defaultValue='New Concept Name'
                                />
                                <br/>
                                <br/>
                                <Input 
                                    id='set-new__node-lesson'
                                    ref={this.newConceptLessonRef}
                                    defaultValue='New Concept Lesson'
                                />
                            </FormControl>
                            <br/>
                            <br/>
                            <Button onClick={this.createNewConcept.bind(this)}>Add Concept</Button>                               
                        </Typography>
                    </Paper>
                </Modal>
                <Modal
                    open={this.state.showAddRelatedNodeModal}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                    style={{ width : '40%', top : '50px', left: '30%', right : '30%', position : 'absolute' }}
                >
                    <Paper className="avo-card">
                        <IconButton style={{ position : 'absolute', right : '9px', top : '9px' }} onClick={() => this.setState({ showAddRelatedNodeModal : false })}>
                            <Close/>
                        </IconButton>
                        <Typography variant={'h5'} id="modal-title">
                            Add Related Concept To {this.state.selectedConcept.name}
                        </Typography>
                        <br/>
                        <Typography variant={'body1'} id="modal-description">
                            <FormControl>
                                <Input
                                    id='set-new__node-name'
                                    ref={this.newConceptNameRef}
                                    defaultValue='New Concept Name'
                                />
                                <br/>
                                <br/>
                                <Input 
                                    id='set-new__node-lesson'
                                    ref={this.newConceptLessonRef}
                                    defaultValue='New Concept Lesson'
                                />
                                <br/>
                                <br/>
                                <Input 
                                    id='set-new__relation-weight'
                                    type='number'
                                    ref={this.newRelationWeightRef}
                                    defaultValue='1'
                                />
                            </FormControl>
                            <br/>
                            <br/>
                            <Button onClick={this.createConceptWithRelation.bind(this)}>Add Related Concept</Button>                               
                        </Typography>
                    </Paper>
                </Modal>
                <Modal
                    open={this.state.showAddNodeModal}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                    style={{ width : '40%', top : '50px', left: '30%', right : '30%', position : 'absolute' }}
                >
                    <Paper className="avo-card">
                        <IconButton style={{ position : 'absolute', right : '9px', top : '9px' }} onClick={() => this.setState({ showAddNodeModal : false })}>
                            <Close/>
                        </IconButton>
                        <Typography variant={'h5'} id="modal-title">
                            Add New Concept
                        </Typography>
                        <br/>
                        <Typography variant={'body1'} id="modal-description">
                            <FormControl>
                                <Input
                                    id='set-new__node-name'
                                    ref={this.newConceptNameRef}
                                    defaultValue='New Concept Name'
                                />
                                <br/>
                                <br/>
                                <Input 
                                    id='set-new__node-lesson'
                                    ref={this.newConceptLessonRef}
                                    defaultValue='New Concept Lesson'
                                />
                            </FormControl>
                            <br/>
                            <br/>
                            <Button onClick={this.createNewConcept.bind(this)}>Add Concept</Button>                               
                        </Typography>
                    </Paper>
                </Modal>
                <Modal
                    open={this.state.showAddRelatedNodeModal}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                    style={{ width : '40%', top : '50px', left: '30%', right : '30%', position : 'absolute' }}
                >
                    <Paper className="avo-card">
                        <IconButton style={{ position : 'absolute', right : '9px', top : '9px' }} onClick={() => this.setState({ showAddRelatedNodeModal : false })}>
                            <Close/>
                        </IconButton>
                        <Typography variant={'h5'} id="modal-title">
                            Add Related Concept To {this.state.selectedConcept.name}
                        </Typography>
                        <br/>
                        <Typography variant={'body1'} id="modal-description">
                            <FormControl>
                                <Input
                                    id='set-new__node-name'
                                    ref={this.newConceptNameRef}
                                    defaultValue='New Concept Name'
                                />
                                <br/>
                                <br/>
                                <Input 
                                    id='set-new__node-lesson'
                                    ref={this.newConceptLessonRef}
                                    defaultValue='New Concept Lesson'
                                />
                                <br/>
                                <br/>
                                <Input 
                                    id='set-new__relation-weight'
                                    type='number'
                                    min={'1'}
                                    max={'4'}
                                    ref={this.newRelationWeightRef}
                                    defaultValue='1'
                                />
                            </FormControl>
                            <br/>
                            <br/>
                            <Button onClick={this.createConceptWithRelation.bind(this)}>Add Related Concept</Button>                               
                        </Typography>
                    </Paper>
                </Modal>
            </div>
        );
    }
   
    getClasses() {
        Http.getSections(
            res => {
                console.log(res);
                const classes = res.sections;
                // if (classes.length > 0) {
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
                // }
            },
            err => {
                console.log(err);
            },
        );
    };

    openWeightModal(node: WeightedConcept) {
        this.setState({
            showModal : true,
            modalNode : node
        });
    };

    createNewConcept() {
        const _this: TagView = this;
        const name:string    = (document as any).getElementById('set-new__node-name').value;
        const lesson:string  = (document as any).getElementById('set-new__node-lesson').value;
        console.log(name, lesson);
        Http.addConcept(
            2,
            name,
            lesson,
            res => {
                const newconcept: any = res;
                const concepts: Concept[] = [..._this.state.concepts];
                const edges: Edge[] = [..._this.state.edges];
                concepts.push({ conceptID : newconcept.ID, name : name, lesson : lesson } as Concept);
                _this.setState({
                    showAddNodeModal : false,
                    concepts : concepts,
                    edges : edges,
                }, 
                () => {
                    _this.chartRef.current.init();
                });
            },
            err => {
                console.log(err);
            },
        );
    };

    createConceptWithRelation() {
        const _this: TagView = this;
        const name:string   = (document as any).getElementById('set-new__node-name').value;
        const lesson:string = (document as any).getElementById('set-new__node-lesson').value;
        const weight:string = (document as any).getElementById('set-new__relation-weight').value;
        Http.addConcept(
            2,
            name,
            lesson,
            res => {
                console.log(res);
                const newconcept: any = res;
                const newedge: Edge = {
                    weight : parseInt(weight),
                    parent : _this.state.selectedConcept.conceptID,
                    child  : newconcept.conceptID,
                };
                Http.setConceptRelation(
                    newedge.parent,
                    newedge.child,
                    newedge.weight,
                    res => {
                        console.log(res);
                        const concepts: Concept[] = [..._this.state.concepts];
                        const edges: Edge[] = [..._this.state.edges];
                        concepts.push({ conceptID : newconcept.ID, name : newconcept.name, lesson : newconcept.lesson } as Concept);
                        edges.push(newedge);
                        _this.setState({
                            showAddRelatedNodeModal : false,
                            concepts : concepts,
                            edges : edges,
                        }, 
                        () => {
                            _this.chartRef.current.init();
                        });       
                    },
                    err => {
                        console.log(err);
                    },
                );
            },
            err => {
                console.log(err);
            },
        );
    };

    getParentNodes(id: number) {
        const parentNodes:WeightedConcept[] = [];
        const conceptMapByID:any = {};
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
        const childNodes:WeightedConcept[] = [];
        const conceptMapByID:any = {};
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
            tagName         : selectedConcept.name,
            lessonText      : selectedConcept.lesson
        });
    };

    gotoSelectedNode(node: any) {
        console.log(node);
        this.chartRef.current.selectNode(`node-${node.conceptID}-end`);
    };

    getTagNodes = () => {
        Http.getConceptGraph(
            2,//this.state.selectedClass.classID,
            res => {
                console.log(res)
                this.setState({
                    // tagNodes : data,
                    concepts: res.concepts,
                    edges: res.edges,
                    nodesLoaded : true
                });
            },
            console.warn,
        );
    };

    changeClass = () => {
        const {selectedClassName, classes} = this.state;
        if (selectedClassName !== 'Select class...') {
            const selectedClass = classes.find((c: GetSections_Section) => c.name === selectedClassName);
            if (selectedClass) {
                this.setState({selectedClass});
                this.getTagNodes();
            }
        }
    };
}
