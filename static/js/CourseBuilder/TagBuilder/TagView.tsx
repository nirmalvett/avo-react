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
import {
    FormControl,
    IconButton,
    Input,
    InputAdornment,
    InputLabel,
} from '@material-ui/core';

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

interface Tag {
    childOrder: number; 
    parent: any; 
    tagID: number; 
    tagName: string;
}

interface TagViewState {
    currentView: string;
    selectedClassName: string;
    classNames: string[];
    classes: Class[];
    selectedClass: Class;
    loadingClasses: boolean;
    editingTagName: boolean;
    selectedTagIndex: 0;
    tagNodes: Tag[];
    nodesLoaded: boolean;
}

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
            selectedTagIndex: 0,
            tagNodes: [],
            nodesLoaded: false
        };
    }
    componentDidMount() {
        this.getClasses();
    }

    render() {
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
                                {this.state.nodesLoaded && <TreeView theme={this.props.theme} nodes={this.state.tagNodes}/> }
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

    getTagNodes = () => {
        Http.getTags(
            this.state.selectedClass.classID,
            res => {
                const data = res.tags;
                this.setState({
                    tagNodes : data,
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
