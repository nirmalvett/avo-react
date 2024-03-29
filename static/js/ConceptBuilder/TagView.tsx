import React, {Component} from 'react';

import TreeView from './TreeView';
import Downshift from 'downshift';
import debounce from '../SharedComponents/AVODebouncer';
import AVOPopupMenu from '../SharedComponents/AVOPopupMenu';
import {
    Edit,
    ExpandMore,
    ExpandLess,
    Add,
    Fullscreen,
    Save,
    Lock,
    Close,
    RedoOutlined,
    Image
} from '@material-ui/icons';
import {
    Button,
    Card,
    Collapse,
    Grid,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    ListItemIcon,
    MenuItem,
    Modal,
    Select,
    Tab,
    Tabs,
    FormControl,
    IconButton,
    Input,
    InputAdornment,
    TextField,
    Fade,
    Paper,
    Typography,
} from '@material-ui/core';
import {MenuItemProps} from '@material-ui/core/MenuItem';
import {TextFieldProps} from '@material-ui/core/TextField';
import * as Http from '../Http';
import {Course} from '../Http/types';
// @ts-ignore
import SwipeableViews from 'react-swipeable-views';
import {Content} from '../HelperFunctions/Content';
import ImageUploader from "../ImageUploader/ImageUploader";
import { height } from '@material-ui/system';

interface Concept {
    conceptID: number;
    name: string;
    lesson: string;
    type: number;
}

interface WeightedConcept {
    conceptID: number;
    name: string;
    lesson: string;
    weight: number;
    type: number;
    nodeType: number;
}

interface Edge {
    child: number;
    parent: number;
    weight: number;
    type: number;
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
    showImages: boolean;
    currentView: string;
    selectedClassName: string;
    classNames: string[];
    classes: Course[];
    selectedClass: Course;
    loadingClasses: boolean;

    editingTagName: boolean;
    tagName: string;

    lessonText: string;
    isEditingLesson: boolean;

    showParentNodes: boolean;
    showChildNodes: boolean;

    selectedConcept: Concept;
    selectedGrouping: number;
    concepts: Concept[];
    edges: Edge[];

    showModal: boolean;
    showAddNodeModal: boolean;
    showAddRelatedNodeModal: boolean;
    showSearch: boolean;
    showAddGrouping: boolean;
    showAddToGroup: boolean;
    isAddingParent: boolean;
    modalNode: WeightedConcept;
    activeTab: number;
    conceptSearchString: string;
    selectedSearchItem: Concept;
    isSearching: boolean;
    nodesLoaded: boolean;
    relationWeight: number;
    relationType: number;
}

interface TabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: any;
    value: any;
}

function TabPanel(props: TabPanelProps) {
    const {children, value, index, ...other} = props;

    return (
        <Typography
            component='div'
            role='tabpanel'
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            <p>{children}</p>
        </Typography>
    );
}

function a11yProps(index: any) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}

let popperNode: HTMLDivElement | null | undefined;

interface Suggestion {
    conceptID: number;
    name: string;
    lesson: string;
}

type RenderInputProps = TextFieldProps & {
    ref?: React.Ref<HTMLDivElement>;
    onChangeFunc: any;
};

function renderInput(inputProps: RenderInputProps) {
    const {InputProps, ref, onChangeFunc, ...other} = inputProps;
    return (
        <TextField
            InputProps={{
                ...InputProps,
            }}
            onChange={onChangeFunc}
            {...other}
        />
    );
}

interface RenderSuggestionProps {
    highlightedIndex: number | null;
    index: number;
    itemProps: MenuItemProps<'div', { button?: never }>;
    selectedItem: Concept;
    suggestion: Suggestion;
    onClick: any;
}

function renderSuggestion(suggestionProps: RenderSuggestionProps) {
    const {suggestion, index, itemProps, highlightedIndex, selectedItem, onClick} = suggestionProps;
    const isHighlighted = highlightedIndex === index;
    const isSelected = true;

    return (
        <MenuItem
            {...itemProps}
            key={suggestion.conceptID}
            selected={isHighlighted}
            component='div'
            onClick={onClick}
            style={{
                fontWeight: isSelected ? 500 : 400,
            }}
        >
            {suggestion.name}
        </MenuItem>
    );
}

function getSuggestions(value: string, suggestions: Concept[], {showEmpty = false} = {}) {
    const inputValue = value.toLowerCase();
    const inputLength = inputValue.length;
    let count = 0;
    return inputLength === 0 && !showEmpty
        ? []
        : suggestions.filter(Concept => {
            const keep =
                count < 5 && Concept.name.slice(0, inputLength).toLowerCase() === inputValue;

            if (keep) {
                count += 1;
            }

            return keep;
        });
}

export default class TagView extends Component<TagViewProps, TagViewState> {
    chartRef: { current: TreeView };
    newConceptNameRef: React.RefObject<{}>;
    newConceptLessonRef: React.RefObject<{}>;
    newRelationWeightRef: React.RefObject<{}>;
    relationTypes: string[];

    constructor(props: TagViewProps) {
        super(props);
        this.state = {
            showImages: false,
            currentView: 'tagTreeView',
            selectedClassName: 'Select class...',
            classNames: [],
            classes: [],
            selectedClass: {} as Course,
            loadingClasses: true,

            selectedConcept: {} as Concept,
            selectedGrouping: 0,
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
            isAddingParent: false,
            showAddGrouping: false,
            showAddToGroup: false,
            showAddRelatedNodeModal: false,
            showSearch: false,
            modalNode: {} as WeightedConcept,
            activeTab: 0,
            conceptSearchString: '',
            nodesLoaded: false,
            selectedSearchItem: {} as Concept,
            isSearching: false,
            relationWeight: 1,
            relationType: 0,
        };
        this.chartRef = React.createRef() as { current: TreeView };
        this.newConceptNameRef = React.createRef();
        this.newConceptLessonRef = React.createRef();
        this.newRelationWeightRef = React.createRef();
        this.relationTypes = [
            'Direct Relationship', 
            'Order Inconsequent Relationship', 
            'Indirect Relationship'
        ];
    }

    componentDidMount() {
        this.getClasses();
    }

    render() {
        const {showChildNodes, showParentNodes} = this.state;
        const menuOptions: any = [
            {
                label: 'Add Concept',
                disabled: !this.state.selectedClass.canEdit,
                onClick: () => {
                    this.setState({showAddNodeModal: true});
                },
            },
            {
                label: 'Search for Concept',
                disabled: !this.state.concepts.length,
                onClick: () => {
                    this.setState({showSearch : true});
                }
            },
            {
                label: 'Add Group',
                disabled: !this.state.selectedClass.canEdit,
                onClick: () => {
                    this.setState({showAddGrouping: true});
                },
            }
        ];
        if (!!this.state.selectedConcept.name) {
            if(this.state.selectedConcept.type == 0)
            {
                menuOptions.push(
                    {
                        label: 'Add to Group',
                        disabled: !this.state.selectedClass.canEdit,
                        onClick: () => {
                            this.setState({ showAddToGroup : true });
                        },
                    },
                    {
                        label: 'Edit Lesson',
                        disabled: !this.state.selectedClass.canEdit,
                        onClick: () => {
                            this.setState({isEditingLesson: true});
                        },
                    },
                );
            }
            menuOptions.push(
                {
                    label: `Delete ${this.state.selectedConcept.type == 0 ? 'Concept' : 'Group'}`,
                    disabled: !this.state.selectedClass.canEdit,
                    onClick: this.deleteConcept.bind(this),
                },
            );
        }
        const lessonChangeDebouncer = debounce({
            callback: (e: any) => this.setState({lessonText: e.target.value}),
            wait: 1000,
            immediate: false,
        });
        if (!this.state.loadingClasses && !this.state.classNames.length) {
            return (
                <div>
                    <br/>
                    <br/>
                    <Typography variant={'body1'} style={{textAlign: 'center'}}>
                        You currently have no courses.
                    </Typography>
                </div>
            );
        }
        const addingSelfAsRelation = this.addRelationDisabled.bind(this)();
        return (
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    margin: 0,
                    overflowY: 'auto',
                    padding: 0
                }}
            >
                {this.state.loadingClasses && <div className='avo-loading-icon'/>}
                {this.state.showImages && this.state.isEditingLesson && (
                    <div>
                        <ImageUploader/>
                        <IconButton
                            onClick={() => this.setState({showImages: false})}
                            aria-label='add'
                            style={{
                                position: 'absolute',
                                bottom: '28px',
                                right: '26px',
                                zIndex: 100,
                            }}
                        >
                            <Close/>
                        </IconButton>
                    </div>
                )}
                {!this.state.showImages && this.state.isEditingLesson && (
                    <Fade in={this.state.isEditingLesson}>
                        <div
                            style={{
                                width: '100%',
                                margin: 0,
                                padding: 0,
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                overflowY: 'auto',
                            }}
                        >
                            <IconButton
                                onClick={() => this.setState({showImages: true})}
                                aria-label='add'
                                style={{
                                    position: 'absolute',
                                    bottom: '28px',
                                    right: '146px',
                                    zIndex: 100,
                                }}
                            >
                                <Image/>
                            </IconButton>
                            <IconButton
                                onClick={() =>
                                    this.setState({isEditingLesson: false}, () => {
                                        setTimeout(() => {
                                            this.gotoSelectedNode(this.state.selectedConcept);
                                        }, 400);
                                    })
                                }
                                aria-label='add'
                                style={{
                                    position: 'absolute',
                                    bottom: '28px',
                                    right: '86px',
                                    zIndex: 100,
                                }}
                            >
                                <Close/>
                            </IconButton>
                            <IconButton
                                onClick={() =>
                                    this.setState({isEditingLesson: false}, () => {
                                        const string_copy: string = (
                                            ' ' + this.state.lessonText
                                        ).slice(1);
                                        setTimeout(() => {
                                            this.saveLesson(string_copy);
                                            // this.gotoSelectedNode(this.state.selectedConcept);
                                            // setTimeout(
                                            //     () => this.setState({lessonText: string_copy}),
                                            //     200,
                                            // );
                                        }, 400);
                                    })
                                }
                                aria-label='add'
                                style={{
                                    position: 'absolute',
                                    bottom: '28px',
                                    right: '28px',
                                    zIndex: 100,
                                }}
                            >
                                <Save/>
                            </IconButton>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    position: 'relative',
                                    height: '-webkit-fill-available',
                                }}
                            >
                                <Grid
                                    container
                                    md={12}
                                    style={{height: '60vh', position: 'relative'}}
                                >
                                    <Grid item md={6} style={{padding: '9px'}}>
                                        <TextField
                                            label='Lesson Content'
                                            variant='outlined'
                                            multiline
                                            defaultValue={this.state.lessonText}
                                            onChange={(e: any) => {
                                                e.persist();
                                                lessonChangeDebouncer(e);
                                            }}
                                            style={{
                                                height: '-webkit-fill-available',
                                                width: '-webkit-fill-available',
                                            }}
                                            margin='dense'
                                            rowsMax='12'
                                        />
                                    </Grid>
                                    <Grid item md={6} style={{padding: '9px'}}>
                                        <Content>{this.state.lessonText}</Content>
                                    </Grid>
                                </Grid>
                            </div>
                        </div> 
                    </Fade>
                )}
                {!this.state.loadingClasses && !this.state.isEditingLesson && (
                    <div
                        style={{
                            width: '100%',
                            margin: 0,
                            padding: 0,
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            overflowY: 'auto',
                        }}
                    >
                        <div style={{height: '100%', position: 'relative'}}>
                            {this.state.nodesLoaded && (
                                <TreeView
                                    ref={this.chartRef}
                                    theme={this.props.theme}
                                    concepts={this.state.concepts}
                                    edges={this.state.edges}
                                    setTagIndex={this.setTagIndex.bind(this)}
                                />
                            )}
                            <Card 
                                className="avo-card avo-generic__low-shadow" 
                                style={{ 
                                    position: 'absolute', 
                                    right : '50px', 
                                    top : '2vh', 
                                    width: '20vw', 
                                    height: '72vh',
                                    maxHeight: '72vh'
                                }}
                            >
                                <div 
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        position: 'relative',
                                        height: '85vh',
                                        width: '20vw' 
                                    }}
                                >

                                    <div style={{position: 'absolute', top: '9px', right: '9px'}}>
                                        <AVOPopupMenu options={menuOptions}/>
                                    </div>
                                    <div
                                        style={{width: '20vw', marginTop: '9px'}}
                                    >
                                        <Select
                                            value={this.state.selectedClassName}
                                            input={<Input name='data' id='select-class'/>}
                                            onChange={e =>
                                                this.setState(
                                                    {selectedClassName: e.target.value as string},
                                                    () => this.changeClass(),
                                                )
                                            }
                                        >
                                            {this.state.classes.map((c: Course, i: number) => (
                                                <MenuItem
                                                    key={i}
                                                    value={c.name}
                                                >
                                                    <ListItemText style={{float: 'left'}}>
                                                        {c.name}
                                                    </ListItemText>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {!!this.state.selectedConcept.name ? (
                                            <>
                                                <br/>
                                                <br/>
                                                <FormControl>
                                                    <Input
                                                        id='edit-concept'
                                                        value={this.state.tagName}
                                                        disabled={!this.state.editingTagName}
                                                        onChange={e =>
                                                            this.setState({tagName: e.target.value})
                                                        }
                                                        endAdornment={
                                                            <InputAdornment position='end'>
                                                                <IconButton
                                                                    style={{top: -8}}
                                                                    disabled={
                                                                        !this.state.selectedClass
                                                                            .canEdit
                                                                    }
                                                                    onClick={() =>
                                                                        this.setState({
                                                                            editingTagName: !this
                                                                                .state
                                                                                .editingTagName,
                                                                        })
                                                                    }
                                                                >
                                                                    <Edit/>
                                                                </IconButton>
                                                            </InputAdornment>
                                                        }
                                                    />
                                                </FormControl>
                                                <br/>
                                                {this.state.selectedConcept.type != 1 && (
                                                    <List
                                                        component='nav'
                                                        style={{maxHeight: '50vh', overflowY: 'auto'}}
                                                    >
                                                        <ListItem
                                                            button
                                                            onClick={() =>
                                                                this.setState({
                                                                    showParentNodes: !showParentNodes,
                                                                })
                                                            }
                                                        >
                                                            <ListItemText
                                                                primary={<b>Prerequisite Concepts</b>}
                                                            />
                                                                {showParentNodes ? (
                                                                    <ExpandLess/>
                                                                ) : (
                                                                    <ExpandMore/>
                                                                )}
                                                                <ListItemSecondaryAction>
                                                                    <IconButton
                                                                        edge='end'
                                                                        aria-label='Add'
                                                                        disabled={
                                                                            !this.state.selectedClass
                                                                                .canEdit
                                                                        }
                                                                        onClick={() =>
                                                                            this.setState({
                                                                                showAddRelatedNodeModal: true,
                                                                                isAddingParent: true,
                                                                            })
                                                                        }
                                                                    >
                                                                        <Add/>
                                                                    </IconButton>
                                                                </ListItemSecondaryAction>
                                                            </ListItem>
                                                            <Collapse
                                                                in={showParentNodes}
                                                                timeout='auto'
                                                                unmountOnExit
                                                            >
                                                                <List component='div' disablePadding>
                                                                    {!!this.state.selectedConcept &&
                                                                    this.getParentNodes(
                                                                        this.state.selectedConcept
                                                                            .conceptID,
                                                                    ).map(WeightedConcept => (
                                                                        <ListItem
                                                                            button
                                                                            classes={{
                                                                                container:
                                                                                    'show-children__on-hover',
                                                                            }}
                                                                        >
                                                                            <ListItemText
                                                                                primary={
                                                                                    WeightedConcept.name
                                                                                }
                                                                                secondary={`Weight: ${WeightedConcept.weight}`}
                                                                            />
                                                                            <ListItemSecondaryAction>
                                                                                <IconButton
                                                                                    edge='end'
                                                                                    classes={{
                                                                                        root:
                                                                                            'hidden_child',
                                                                                    }}
                                                                                    aria-label='Edit'
                                                                                    disabled={
                                                                                        !this.state
                                                                                            .selectedClass
                                                                                            .canEdit
                                                                                    }
                                                                                    onClick={() =>
                                                                                        this.openWeightModal(
                                                                                            WeightedConcept,
                                                                                            true,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <Edit/>
                                                                                </IconButton>
                                                                                <IconButton
                                                                                    edge='end'
                                                                                    classes={{
                                                                                        root:
                                                                                            'hidden_child',
                                                                                    }}
                                                                                    aria-label='Go To'
                                                                                    onClick={() =>
                                                                                        this.gotoSelectedNode(
                                                                                            WeightedConcept,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <RedoOutlined/>
                                                                                </IconButton>
                                                                            </ListItemSecondaryAction>
                                                                        </ListItem>
                                                                    ))}
                                                                </List>
                                                            </Collapse>
                                                            <ListItem
                                                                button
                                                                onClick={() =>
                                                                    this.setState({
                                                                        showChildNodes: !showChildNodes,
                                                                    })
                                                                }
                                                            >
                                                                <ListItemText
                                                                    primary={<b>Subsequent Concepts</b>}
                                                                />
                                                                {showChildNodes ? (
                                                                    <ExpandLess/>
                                                                ) : (
                                                                    <ExpandMore/>
                                                                )}
                                                                <ListItemSecondaryAction>
                                                                    <IconButton
                                                                        edge='end'
                                                                        aria-label='Add'
                                                                        disabled={
                                                                            !this.state.selectedClass
                                                                                .canEdit
                                                                        }
                                                                        onClick={() =>
                                                                            this.setState({
                                                                                showAddRelatedNodeModal: true,
                                                                                isAddingParent: false,
                                                                            })
                                                                        }
                                                                    >
                                                                        <Add/>
                                                                    </IconButton>
                                                                </ListItemSecondaryAction>
                                                            </ListItem>
                                                            <Collapse
                                                                in={showChildNodes}
                                                                timeout='auto'
                                                                unmountOnExit
                                                            >
                                                                <List component='div' disablePadding>
                                                                    {!!this.state.selectedConcept &&
                                                                    this.getChildNodes(
                                                                        this.state.selectedConcept
                                                                            .conceptID,
                                                                    ).map(WeightedConcept => (
                                                                        <ListItem
                                                                            button
                                                                            classes={{
                                                                                container:
                                                                                    'show-children__on-hover',
                                                                            }}
                                                                        >
                                                                            <ListItemText
                                                                                primary={
                                                                                    WeightedConcept.name
                                                                                }
                                                                                secondary={`Weight: ${WeightedConcept.weight}`}
                                                                            />
                                                                            <ListItemSecondaryAction>
                                                                                <IconButton
                                                                                    edge='end'
                                                                                    classes={{
                                                                                        root:
                                                                                            'hidden_child',
                                                                                    }}
                                                                                    aria-label='Edit'
                                                                                    disabled={
                                                                                        !this.state
                                                                                            .selectedClass
                                                                                            .canEdit
                                                                                    }
                                                                                    onClick={() =>
                                                                                        this.openWeightModal(
                                                                                            WeightedConcept,
                                                                                            false,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <Edit/>
                                                                                </IconButton>
                                                                                <IconButton
                                                                                    edge='end'
                                                                                    classes={{
                                                                                        root:
                                                                                            'hidden_child',
                                                                                    }}
                                                                                    aria-label='Go To'
                                                                                    onClick={() =>
                                                                                        this.gotoSelectedNode(
                                                                                            WeightedConcept,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <RedoOutlined/>
                                                                                </IconButton>
                                                                            </ListItemSecondaryAction>
                                                                        </ListItem>
                                                                    ))}
                                                                </List>
                                                            </Collapse>
                                                        </List>
                                                    )}
                                                <IconButton
                                                    onClick={this.saveConcept.bind(this)}
                                                    color='primary'
                                                    aria-label='save'
                                                    disabled={!this.state.selectedClass.canEdit}
                                                    style={{position: 'relative', bottom: '9px', float: 'right'}}
                                                >
                                                    <Save/>
                                                </IconButton>
                                            </>
                                        ) : (
                                            <Typography variant={'body1'} id='modal-description'>
                                                <br/>
                                                <br/>
                                                <br/>
                                                Please Select or Create a Concept
                                            </Typography>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
                {this.state.showModal && (
                    <Modal
                        open={this.state.showModal}
                        aria-labelledby='modal-title'
                        aria-describedby='modal-description'
                        style={{
                            width: '40%',
                            top: '50px',
                            left: '30%',
                            right: '30%',
                            position: 'absolute',
                        }}
                    >
                        <Paper className='avo-card'>
                            <IconButton
                                style={{position: 'absolute', right: '9px', top: '9px'}}
                                onClick={() => this.setState({showModal: false})}
                            >
                                <Close/>
                            </IconButton>
                            <Typography variant={'h5'} id='modal-title'>
                                Weight of relationship between:
                                <br/>
                                {this.state.selectedConcept.name} and {this.state.modalNode.name}
                            </Typography>
                            <br/>
                            <Typography variant={'body1'} id='modal-description'>
                                Current Weight is: {this.state.modalNode.weight}
                                <br/>
                                <Select
                                    value={`${this.state.relationWeight}`}
                                    input={<Input name='data' id='select-class'/>}
                                    onChange={e => {
                                        const newWeight: number = parseInt(e.target
                                            .value as string);
                                        this.setState({relationWeight: newWeight});
                                    }}
                                >
                                    <MenuItem key={'relation-weight-1'} value={'0'}>
                                        0 - None ( delete relation ).
                                    </MenuItem>
                                    <MenuItem key={'relation-weight-1'} value={'1'}>
                                        1 - Somewhat helpful.
                                    </MenuItem>
                                    <MenuItem key={'relation-weight-2'} value={'2'}>
                                        2 - Recommended.
                                    </MenuItem>
                                    <MenuItem key={'relation-weight-3'} value={'3'}>
                                        3 - Strongly recommended.
                                    </MenuItem>
                                    <MenuItem key={'relation-weight-4'} value={'4'}>
                                        4 - Absolutely required.
                                    </MenuItem>
                                </Select>
                                <br/>
                                <br/>
                                Current relation type is: {this.relationTypes[this.state.modalNode.type]}
                                <br/>
                                <Select
                                    value={`${this.state.relationType}`}
                                    input={<Input name='data' id='select-class'/>}
                                    onChange={e => {
                                        const newType: number = parseInt(e.target
                                            .value as string);
                                        this.setState({relationType: newType});
                                    }}
                                >
                                    <MenuItem key={'relation-type-0-add'} value={'0'}>
                                        {this.relationTypes[0]}
                                    </MenuItem>
                                    <MenuItem key={'relation-type-1-add'} value={'1'}>
                                        {this.relationTypes[1]}
                                    </MenuItem>
                                    <MenuItem key={'relation-type-2-add'} value={'2'}>
                                        {this.relationTypes[2]}
                                    </MenuItem>
                                </Select>
                                <br/>
                                <br/>
                                <Button onClick={this.editRelation.bind(this)}>
                                    Edit Relation
                                </Button>
                            </Typography>
                        </Paper>
                    </Modal>
                )}
                {this.state.showAddNodeModal && (
                    <Modal
                        open={this.state.showAddNodeModal}
                        aria-labelledby='modal-title'
                        aria-describedby='modal-description'
                        style={{
                            width: '40%',
                            top: '50px',
                            left: '30%',
                            right: '30%',
                            position: 'absolute',
                        }}
                    >
                        <Paper className='avo-card'>
                            <IconButton
                                style={{position: 'absolute', right: '9px', top: '9px'}}
                                onClick={() => this.setState({showAddNodeModal: false})}
                            >
                                <Close/>
                            </IconButton>
                            <Typography variant={'h5'} id='modal-title'>
                                Add New Concept
                            </Typography>
                            <br/>
                            <Typography variant={'body1'} id='modal-description'>
                                <FormControl>
                                    <Input
                                        id='set-new__node-name'
                                        ref={this.newConceptNameRef}
                                        placeholder='New Concept Name'
                                    />
                                    <br/>
                                    <br/>
                                    <Input
                                        id='set-new__node-lesson'
                                        ref={this.newConceptLessonRef}
                                        placeholder='New Concept Lesson'
                                    />
                                </FormControl>
                                <br/>
                                <br/>
                                <Button onClick={this.createNewConcept.bind(this)}>
                                    Add Concept
                                </Button>
                            </Typography>
                        </Paper>
                    </Modal>
                )}
                {this.state.showSearch && (
                    <Modal
                        open={this.state.showSearch}
                        aria-labelledby='modal-title'
                        aria-describedby='modal-description'
                        style={{
                            width: '40%',
                            top: '50px',
                            left: '30%',
                            right: '30%',
                            position: 'absolute',
                        }}
                    >
                        <Paper className="avo-card">
                            <IconButton
                                style={{
                                    position: 'absolute' as 'absolute',
                                    right: '9px',
                                    top: '9px',
                                    zIndex: 100,
                                }}
                                onClick={() => this.setState({showSearch: false})}
                            >
                                <Close/>
                            </IconButton>
                            <Typography variant={'h5'} id='modal-title'>
                                Search Concepts
                            </Typography>
                            <br/>
                            <Downshift
                                id='downshift-simple'
                                onSelect={e => {
                                    this.setState({conceptSearchString: e});
                                }}
                            >
                                {({
                                        getInputProps,
                                        getItemProps,
                                        getLabelProps,
                                        getMenuProps,
                                        highlightedIndex,
                                        inputValue,
                                        isOpen,
                                        selectedItem,
                                    }) => {
                                    const {onBlur, onFocus, ...inputProps} = getInputProps({
                                        placeholder: 'Search for a Concept',
                                    });

                                    return (
                                        <div>
                                            <TextField
                                                InputProps={{
                                                    placeholder: 'Search for a Concept',
                                                }}
                                                value={this.state.conceptSearchString}
                                                fullWidth={true}
                                                onChange={(e: any) => {
                                                    this.setState({
                                                        conceptSearchString: e.target.value,
                                                        isSearching: true,
                                                    });
                                                }}
                                            />
                                            <div {...getMenuProps()}>
                                                {this.state.isSearching ? (
                                                    <Paper square>
                                                        {getSuggestions(
                                                            this.state.conceptSearchString,
                                                            [...this.state.concepts.filter(Concept => Concept.type != 1)],
                                                        ).map(
                                                            (
                                                                suggestion: Concept,
                                                                index: number,
                                                            ) =>
                                                                renderSuggestion({
                                                                    suggestion,
                                                                    index,
                                                                    itemProps: getItemProps(
                                                                        {
                                                                            item:
                                                                            suggestion.name,
                                                                        },
                                                                    ),
                                                                    highlightedIndex,
                                                                    selectedItem,
                                                                    onClick: () => {
                                                                        console.log(suggestion);
                                                                        this.setState({
                                                                            conceptSearchString: suggestion.name,
                                                                            selectedSearchItem: suggestion,
                                                                            isSearching: false,
                                                                        });
                                                                    },
                                                                }),
                                                        )}
                                                    </Paper>
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                }}
                            </Downshift>
                            <br/>
                            <br/>
                            <br/>
                            <Button color="primary" style={{ position : 'absolute', right : '8px', bottom : '8px' }} onClick={() => {
                                const selectedConcept: Concept = {...this.state.selectedSearchItem} as Concept;
                                this.setState({ // clears the state
                                    conceptSearchString : '',
                                    showSearch: false 
                                });
                                setTimeout(() => this.gotoSelectedNode(selectedConcept), 150);
                            }}>
                                Go To Concept
                            </Button>
                        </Paper>
                    </Modal>
                )}
                {this.state.showAddRelatedNodeModal && (
                    <Modal
                        open={this.state.showAddRelatedNodeModal}
                        aria-labelledby='modal-title'
                        aria-describedby='modal-description'
                        style={{
                            width: '40%',
                            top: '50px',
                            left: '30%',
                            right: '30%',
                            position: 'absolute',
                        }}
                    >
                        <Paper className='avo-card'>
                            <IconButton
                                style={{
                                    position: 'absolute' as 'absolute',
                                    right: '9px',
                                    top: '9px',
                                    zIndex: 100,
                                }}
                                onClick={() => this.setState({showAddRelatedNodeModal: false})}
                            >
                                <Close/>
                            </IconButton>
                            <Tabs
                                value={this.state.activeTab}
                                onChange={(e: any, val: number) => this.setState({activeTab: val})}
                                indicatorColor='primary'
                                textColor='primary'
                                aria-label='full width tabs example'
                            >
                                <Tab label='Add Concept with Relation' {...a11yProps(0)} />
                                <Tab label='Add Relation' {...a11yProps(1)} />
                            </Tabs>
                            <SwipeableViews
                                axis={'x'}
                                index={this.state.activeTab}
                                onChangeIndex={(e: any) => console.log(e)}
                            >
                                <TabPanel value={this.state.activeTab} index={0} dir={'ltr'}>
                                    <Typography variant={'h5'} id='modal-title'>
                                        Add Related Concept To {this.state.selectedConcept.name}
                                    </Typography>
                                    <br/>
                                    <Typography variant={'body1'} id='modal-description'>
                                        <FormControl>
                                            <Input
                                                id='set-new__node-name'
                                                ref={this.newConceptNameRef}
                                                placeholder='New Concept Name'
                                            />
                                            <br/>
                                            <br/>
                                            <Input
                                                id='set-new__node-lesson'
                                                ref={this.newConceptLessonRef}
                                                placeholder='New Concept Lesson'
                                            />
                                            <br/>
                                            <br/>
                                            <Select
                                                value={this.state.relationWeight}
                                                input={<Input name='data' id='select-class'/>}
                                                onChange={e => {
                                                    const newWeight: number = parseInt(e.target
                                                        .value as string);
                                                    this.setState({relationWeight: newWeight});
                                                }}
                                            >
                                                <MenuItem key={'relation-weight-1'} value={'1'}>
                                                    1 - Somewhat helpful.
                                                </MenuItem>
                                                <MenuItem key={'relation-weight-2'} value={'2'}>
                                                    2 - Recommended.
                                                </MenuItem>
                                                <MenuItem key={'relation-weight-3'} value={'3'}>
                                                    3 - Strongly recommended.
                                                </MenuItem>
                                                <MenuItem key={'relation-weight-4'} value={'4'}>
                                                    4 - Absolutely required.
                                                </MenuItem>
                                            </Select>
                                        </FormControl>
                                        <br/>
                                        <br/>
                                        Current relation type is: {this.relationTypes[this.state.modalNode.type]}
                                        <br/>
                                        <Select
                                            value={`${this.state.relationType}`}
                                            input={<Input name='data' id='select-class'/>}
                                            onChange={e => {
                                                const newType: number = parseInt(e.target
                                                    .value as string);
                                                this.setState({relationType: newType});
                                            }}
                                        >
                                            <MenuItem key={'relation-type-0-addrel'} value={'0'}>
                                                {this.relationTypes[0]}
                                            </MenuItem>
                                            <MenuItem key={'relation-type-1-addrel'} value={'1'}>
                                                {this.relationTypes[1]}
                                            </MenuItem>
                                            <MenuItem key={'relation-type-2-addrel'} value={'2'}>
                                                {this.relationTypes[2]}
                                            </MenuItem>
                                        </Select>
                                        <br/>
                                        <br/>
                                        <Button onClick={this.createConceptWithRelation.bind(this)}>
                                            Add Related Concept
                                        </Button>
                                    </Typography>
                                </TabPanel>
                                <TabPanel value={this.state.activeTab} index={1} dir={'ltr'}>
                                    <Downshift
                                        id='downshift-simple'
                                        onSelect={e => {
                                            this.setState({conceptSearchString: e});
                                        }}
                                    >
                                        {({
                                              getInputProps,
                                              getItemProps,
                                              getLabelProps,
                                              getMenuProps,
                                              highlightedIndex,
                                              inputValue,
                                              isOpen,
                                              selectedItem,
                                          }) => {
                                            const {onBlur, onFocus, ...inputProps} = getInputProps({
                                                placeholder: 'Search for a Concept',
                                            });

                                            return (
                                                <div>
                                                    <TextField
                                                        InputProps={{
                                                            placeholder: 'Search for a Concept',
                                                        }}
                                                        value={this.state.conceptSearchString}
                                                        fullWidth={true}
                                                        onChange={(e: any) => {
                                                            this.setState({
                                                                conceptSearchString: e.target.value,
                                                                isSearching: true,
                                                            });
                                                        }}
                                                    />
                                                    <div {...getMenuProps()}>
                                                        {this.state.isSearching ? (
                                                            <Paper square>
                                                                {getSuggestions(
                                                                    this.state.conceptSearchString,
                                                                    [...this.state.concepts.filter(Concept => Concept.type != 1)],
                                                                ).map(
                                                                    (
                                                                        suggestion: Concept,
                                                                        index: number,
                                                                    ) =>
                                                                        renderSuggestion({
                                                                            suggestion,
                                                                            index,
                                                                            itemProps: getItemProps(
                                                                                {
                                                                                    item:
                                                                                    suggestion.name,
                                                                                },
                                                                            ),
                                                                            highlightedIndex,
                                                                            selectedItem,
                                                                            onClick: () => {
                                                                                this.setState({
                                                                                    selectedSearchItem: suggestion,
                                                                                    isSearching: false,
                                                                                });
                                                                            },
                                                                        }),
                                                                )}
                                                            </Paper>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            );
                                        }}
                                    </Downshift>
                                    {!this.state.isSearching &&
                                    !!this.state.selectedSearchItem.conceptID && (
                                        <Typography variant={'body1'} id='modal-description'>
                                            Add Relation from{' '}
                                            {this.state.isAddingParent
                                                ? this.state.selectedSearchItem.name
                                                : this.state.selectedConcept.name}{' '}
                                            to{' '}
                                            {this.state.isAddingParent
                                                ? this.state.selectedConcept.name
                                                : this.state.selectedSearchItem.name}
                                            <br/>
                                            <br/>
                                            <Select
                                                value={this.state.relationWeight}
                                                input={<Input name='data' id='select-class'/>}
                                                onChange={e => {
                                                    const newWeight: number = parseInt(e.target
                                                        .value as string);
                                                    this.setState({relationWeight: newWeight});
                                                }}
                                            >
                                                <MenuItem key={'relation-weight-1'} value={'1'}>
                                                    1 - Somewhat helpful.
                                                </MenuItem>
                                                <MenuItem key={'relation-weight-2'} value={'2'}>
                                                    2 - Recommended.
                                                </MenuItem>
                                                <MenuItem key={'relation-weight-3'} value={'3'}>
                                                    3 - Strongly recommended.
                                                </MenuItem>
                                                <MenuItem key={'relation-weight-4'} value={'4'}>
                                                    4 - Absolutely required.
                                                </MenuItem>
                                            </Select>
                                            <br/>
                                            <br/>
                                            Current relation type is: {this.relationTypes[this.state.modalNode.type]}
                                            <br/>
                                            <Select
                                                value={`${this.state.relationType}`}
                                                input={<Input name='data' id='select-class'/>}
                                                onChange={e => {
                                                    const newType: number = parseInt(e.target
                                                        .value as string);
                                                    this.setState({relationType: newType});
                                                }}
                                            >
                                                <MenuItem key={'relation-type-0-searchNode'} value={'0'}>
                                                    {this.relationTypes[0]}
                                                </MenuItem>
                                                <MenuItem key={'relation-type-1-searchNode'} value={'1'}>
                                                    {this.relationTypes[1]}
                                                </MenuItem>
                                                <MenuItem key={'relation-type-2-searchNode'} value={'2'}>
                                                    {this.relationTypes[2]}
                                                </MenuItem>
                                            </Select>
                                            <br/>
                                            <br/>
                                            <Button disabled={addingSelfAsRelation} onClick={this.setRelation.bind(this)}>
                                                Add Relation
                                            </Button>
                                            {addingSelfAsRelation && <Typography style={{color: 'red'}}>Cannot make a concept its own parent</Typography>}
                                        </Typography>
                                    )}
                                </TabPanel>
                            </SwipeableViews>
                        </Paper>
                    </Modal>
                )}
                {this.state.showAddGrouping && (
                    <Modal
                        open={this.state.showAddGrouping}
                        aria-labelledby='modal-title'
                        aria-describedby='modal-description'
                        style={{
                            width: '40%',
                            top: '50px',
                            left: '30%',
                            right: '30%',
                            position: 'absolute',
                        }}
                    >
                        <Paper className='avo-card'>
                            <IconButton
                                style={{
                                    position: 'absolute' as 'absolute',
                                    right: '9px',
                                    top: '9px',
                                    zIndex: 100,
                                }}
                                onClick={() => this.setState({ showAddGrouping : false })}
                            >
                                <Close/>
                            </IconButton>
                            <Typography variant={'h5'} id='modal-title'>
                                Add New Grouping
                            </Typography>
                            <br/>
                            <Typography variant={'body1'} id='modal-description'>
                                <FormControl>
                                    <Input
                                        id='set-new__node-name'
                                        ref={this.newConceptNameRef}
                                        placeholder='New Group Name'
                                    />
                                </FormControl>
                                <br/>
                                <br/>
                                <Button onClick={this.createNewConcept.bind(this)}>
                                    Add Grouping
                                </Button>
                            </Typography>
                        </Paper>
                    </Modal>
                )}
                {this.state.showAddToGroup && (
                    <Modal
                        open={this.state.showAddToGroup}
                        aria-labelledby='modal-title'
                        aria-describedby='modal-description'
                        style={{
                            width: '40%',
                            top: '50px',
                            left: '30%',
                            right: '30%',
                            position: 'absolute',
                        }}
                    >
                        <Paper className='avo-card'>
                            <IconButton
                                style={{
                                    position: 'absolute' as 'absolute',
                                    right: '9px',
                                    top: '9px',
                                    zIndex: 100,
                                }}
                                onClick={() => this.setState({ showAddToGroup : false })}
                            >
                                <Close/>
                            </IconButton>
                            <Typography variant={'h5'} id='modal-title'>
                                Add {this.state.selectedConcept.name} to group
                            </Typography>
                            <br/>
                            <Select
                                value={`${this.state.selectedGrouping}`}
                                input={<Input name='data' id='select-class'/>}
                                onChange={e => {
                                    const groupIndex: number = parseInt(e.target.value as string);
                                    this.setState({selectedGrouping: groupIndex});
                                }}
                            >
                                {this.getGroupNodes().map((Concept, i:number) => 
                                    <MenuItem key={`:GroupNode@${i}`} value={i}>
                                        {Concept.name}
                                    </MenuItem>
                                )}
                            </Select>
                            <br/>
                            <Typography variant={'body1'} id='modal-description'>
                                
                                <br/>
                                <br/>
                                <Button onClick={() => this.addConceptToGroup()}>
                                    Add to group
                                </Button>
                            </Typography>
                        </Paper>
                    </Modal>
                )}
            </div>
        );
    }

    addRelationDisabled() {
        const newedge: Edge = {
            weight: this.state.relationWeight,
            parent: this.state.isAddingParent
                ? this.state.selectedSearchItem.conceptID
                : this.state.selectedConcept.conceptID,
            child: this.state.isAddingParent
                ? this.state.selectedConcept.conceptID
                : this.state.selectedSearchItem.conceptID,
            type: this.state.relationType
        };
        return newedge.parent === newedge.child;
    }

    checkIfConceptCreationParametersValid() {
        const name: string = (document as any).getElementById('set-new__node-name').value;
        // const lesson: string = (document as any).getElementById('set-new__node-lesson').value;
        let errorString: string = '';
        if (name.length == 0) errorString += 'Please Specify a Name for the Concept \n';
        if (!!errorString.length) alert(errorString);

        return !!errorString;
    }

    setRelation() {
        const newedge: Edge = {
            weight: this.state.relationWeight,
            parent: this.state.isAddingParent
                ? this.state.selectedSearchItem.conceptID
                : this.state.selectedConcept.conceptID,
            child: this.state.isAddingParent
                ? this.state.selectedConcept.conceptID
                : this.state.selectedSearchItem.conceptID,
            type: this.state.relationType
        };
        Http.setConceptRelation(
            newedge.parent,
            newedge.child,
            newedge.weight,
            newedge.type,
            res => {
                console.log(res);
                const concepts: Concept[] = [...this.state.concepts];
                const edges: Edge[] = [...this.state.edges];
                edges.push(newedge);
                this.setState(
                    {
                        showAddRelatedNodeModal: false,
                        concepts: concepts,
                        edges: edges,
                        relationWeight: 1,
                        isSearching: false,
                        selectedSearchItem: {} as Concept,
                        conceptSearchString: '',
                    },
                    () => {
                        this.chartRef.current.init();
                        setTimeout(() => this.gotoSelectedNode(this.state.selectedConcept), 150);
                    },
                );
            },
            err => {
                console.log(err);
            },
        );
    }

    editRelation() {
        const newedge: Edge = {
            weight: this.state.relationWeight,
            parent: this.state.isAddingParent
                ? this.state.modalNode.conceptID
                : this.state.selectedConcept.conceptID,
            child: this.state.isAddingParent
                ? this.state.selectedConcept.conceptID
                : this.state.modalNode.conceptID,
            type: this.state.relationType
        };
        Http.setConceptRelation(
            newedge.parent,
            newedge.child,
            newedge.weight,
            newedge.type,
            res => {
                console.log(res);
                const concepts: Concept[] = [...this.state.concepts];
                const edges: Edge[] = [...this.state.edges]
                    .map(Edge => {
                        if (Edge.parent == newedge.parent && Edge.child == newedge.child)
                        {
                            Edge.weight = newedge.weight;
                            Edge.type = newedge.type;
                        }
                        return Edge;
                    })
                    .filter(Edge => Edge.weight != 0);
                this.setState(
                    {
                        showModal: false,
                        concepts: concepts,
                        edges: edges,
                        relationWeight: 1,
                        relationType: 0,
                        modalNode: {} as WeightedConcept,
                    },
                    () => {
                        this.chartRef.current.init();
                        setTimeout(() => this.gotoSelectedNode(this.state.selectedConcept), 150);
                    },
                );
            },
            err => {
                console.log(err);
            },
        );
    }

    getClasses() {
        Http.getCourses(
            res => {
                console.log(res);
                const classes = res.courses;
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
    }

    openWeightModal(node: WeightedConcept, isAddingParent: boolean) {
        this.setState({
            showModal: true,
            modalNode: node,
            relationType: node.type,
            relationWeight: node.weight,
            isAddingParent: isAddingParent,
        });
    }

    saveConcept() {
        const conceptID: number = this.state.selectedConcept.conceptID;
        const conceptName: string = this.state.tagName;
        const conceptLesson: string = this.state.lessonText;
        const conceptType: number = this.state.selectedConcept.type;
        Http.editConcept(
            conceptID,
            conceptName,
            conceptLesson,
            conceptType,
            res => {
                console.log(res);
                const concepts: Concept[] = [...this.state.concepts];
                const edges: Edge[] = [...this.state.edges];

                const newConcepts: Concept[] = concepts.map(Concept => {
                    if (conceptID == Concept.conceptID) {
                        Concept.name = conceptName;
                        Concept.lesson = conceptLesson;
                    }
                    return Concept;
                });
                this.setState(
                    {
                        concepts: newConcepts,
                        edges: edges,
                    },
                    () => {
                        this.chartRef.current.init();
                        setTimeout(() => this.gotoSelectedNode(this.state.selectedConcept), 150);
                    },
                );
            },
            res => {
                console.warn(res);
            },
        );
    }

    saveLesson(lesson: string) {
        Http.editConcept(
            this.state.selectedConcept.conceptID,
            this.state.selectedConcept.name,
            lesson,
            this.state.selectedConcept.type,
            res => {
                console.log(res);
                const concepts: Concept[] = [...this.state.concepts];
                const edges: Edge[] = [...this.state.edges];

                const newConcepts: Concept[] = concepts.map(Concept => {
                    if (this.state.selectedConcept.conceptID == Concept.conceptID) {
                        Concept.name = this.state.selectedConcept.name;
                        Concept.lesson = lesson;
                    }
                    return Concept;
                });
                this.setState(
                    {
                        concepts: newConcepts,
                        edges: edges,
                        isEditingLesson: false,
                    },
                    () => {
                        this.chartRef.current.init();
                        setTimeout(() => this.gotoSelectedNode(this.state.selectedConcept), 150);
                    },
                );
            },
            res => {
                console.warn(res);
            },
        );
    }

    deleteConcept() {
        const conceptID: number = this.state.selectedConcept.conceptID;
        Http.deleteConcept(
            conceptID,
            res => {
                this.getTagNodes();
                setTimeout(() => {
                    this.chartRef.current.init();
                }, 500);
            },
            res => {
            },
        );
    }

    createNewConcept() {
        const _this: TagView = this;
        const name: string = (document as any).getElementById('set-new__node-name').value;
        const lesson: string = this.state.showAddGrouping ? '' : (document as any).getElementById('set-new__node-lesson').value;
        if (this.checkIfConceptCreationParametersValid()) return;
        Http.addConcept(
            this.state.selectedClass.courseID,
            name,
            lesson,
            this.state.showAddGrouping ? 1 : 0,
            res => {
                const newconcept: Concept = {conceptID: res.conceptID, name: name, lesson: lesson, type: this.state.showAddGrouping ? 1 : 0};
                const concepts: Concept[] = [..._this.state.concepts];
                const edges: Edge[] = [..._this.state.edges];
                concepts.push(newconcept);
                _this.setState(
                    {
                        showAddNodeModal: false,
                        showAddGrouping: false,
                        concepts: concepts,
                        edges: edges,
                    },
                    () => {
                        _this.chartRef.current.init();
                        setTimeout(() => _this.gotoSelectedNode(newconcept), 150);
                    },
                );
            },
            err => {
                console.log(err);
            },
        );
    }

    createConceptWithRelation() {
        const _this: TagView = this;
        const isAddingParent: boolean = this.state.isAddingParent;
        const name: string = (document as any).getElementById('set-new__node-name').value;
        const lesson: string = (document as any).getElementById('set-new__node-lesson').value;
        const weight = this.state.relationWeight;
        if (this.checkIfConceptCreationParametersValid()) return;
        Http.addConcept(
            this.state.selectedClass.courseID,
            name,
            lesson,
            0,
            res => {
                console.log(res);
                const newconcept: Concept = {
                    conceptID: res.conceptID,
                    name: name,
                    lesson: lesson,
                    type: 0
                };
                const newedge: Edge = {
                    weight: weight,
                    parent: isAddingParent
                        ? newconcept.conceptID
                        : _this.state.selectedConcept.conceptID,
                    child: isAddingParent
                        ? _this.state.selectedConcept.conceptID
                        : newconcept.conceptID,
                    type: _this.state.relationType
                };
                Http.setConceptRelation(
                    newedge.parent,
                    newedge.child,
                    newedge.weight,
                    newedge.type,
                    res => {
                        console.log(res);
                        const concepts: Concept[] = [..._this.state.concepts];
                        const edges: Edge[] = [..._this.state.edges];
                        concepts.push(newconcept);
                        edges.push(newedge);
                        _this.setState(
                            {
                                showAddRelatedNodeModal: false,
                                concepts: concepts,
                                edges: edges,
                            },
                            () => {
                                _this.chartRef.current.init();
                                setTimeout(() => _this.gotoSelectedNode(newconcept), 150);
                            },
                        );
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
    }

    getParentNodes(id: number) {
        const parentNodes: WeightedConcept[] = [];
        const conceptMapByID: any = {};
        this.state.concepts.filter(Concept => Concept.type != 1).forEach(Concept => (conceptMapByID[Concept.conceptID] = Concept));
        this.state.edges.forEach(Edge => {
            if (Edge.child === id) {
                const Node = {...conceptMapByID[Edge.parent]};
                Node.weight = Edge.weight;
                Node.nodeType = {...conceptMapByID[Edge.parent]}.type;
                Node.type = Edge.type;
                parentNodes.push(Node);
            }
        });
        return parentNodes;
    }

    getChildNodes(id: number) {
        const childNodes: WeightedConcept[] = [];
        const conceptMapByID: any = {};
        [...this.state.concepts].filter(Concept => Concept.type != 1).forEach(Concept => (conceptMapByID[Concept.conceptID] = {...Concept}));
        this.state.edges.forEach(Edge => {
            if (Edge.parent == id) {
                const Node = {...conceptMapByID[Edge.child]};
                Node.weight = Edge.weight;
                Node.nodeType = {...conceptMapByID[Edge.child]}.type;
                Node.type = Edge.type;
                childNodes.push(Node);
            }
        });
        return childNodes;
    }

    getGroupNodes() {
        return [...this.state.concepts].filter(Concept => Concept.type == 1);
    };

    addConceptToGroup() {
        const _this = this;
        const newedge: Edge = {
            weight: 3,
            parent: this.getGroupNodes()[this.state.selectedGrouping].conceptID,
            child: this.state.selectedConcept.conceptID,
            type: 3
        };
        Http.setConceptRelation(
            this.getGroupNodes()[this.state.selectedGrouping].conceptID,
            this.state.selectedConcept.conceptID,
            3, // strongest association just cause we need something here :P
            3, // currently this is not used for a formal edge type, therefore we'll use it to denot a group relation 
            res => {
                console.log(res);
                const edges: Edge[] = [..._this.state.edges];
                edges.push(newedge);
                _this.setState(
                    {
                        edges: edges,
                        showAddToGroup: false,
                    },
                    () => {
                        _this.chartRef.current.init();
                        setTimeout(() => _this.gotoSelectedNode(this.state.selectedConcept), 150);
                    },
                );
            },
            err => {
                console.log(err);
            },
        );
    }

    setTagIndex(index: number) {
        console.log(index);
        const selectedConcept = this.state.concepts[index];
        console.log(selectedConcept);
        this.setState({
            selectedConcept: selectedConcept,
            tagName: selectedConcept.name,
            lessonText: selectedConcept.lesson,
        });
    }

    gotoSelectedNode(node: any) {
        this.chartRef.current.selectNode(`node-${node.conceptID}-end`);
    }

    getTagNodes = () => {
        Http.getConceptGraph(
            this.state.selectedClass.courseID, //this.state.selectedClass.classID,
            res => {
                console.log(res);
                this.setState({
                    // tagNodes : data,
                    concepts: res.concepts,
                    edges: res.edges,
                    selectedConcept: {} as Concept,
                    nodesLoaded: true,
                });
            },
            console.warn,
        );
    };

    changeClass = () => {
        const {selectedClassName, classes} = this.state;
        if (selectedClassName !== 'Select class...') {
            const selectedClass = classes.find(c => c.name === selectedClassName);
            if (selectedClass) {
                this.setState({selectedClass}, () => {
                    this.getTagNodes();
                    setTimeout(() => {
                        this.chartRef.current.init();
                    }, 500);
                });
            }
        }
    };
}
