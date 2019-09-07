import React, {Component} from 'react';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import TreeView from './TreeView';
import FolderView from './FolderView';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import * as Http from '../../Http';
import {Class} from '../../Models';

import Input from '@material-ui/core/Input';
interface TagViewProps {}

interface TagViewState {
    currentView: string;
    selectedClassName: string;
    classNames: string[];
    classes: Class[];
    selectedClass: Class;
    loadingClasses: boolean;
}

export default class TagView extends Component<TagViewProps, TagViewState> {
    constructor(props: TagViewProps) {
        super(props);
        this.state = {
            currentView: 'folderView',
            selectedClassName: 'Select class...',
            classNames: [],
            classes: [],
            selectedClass: {} as Class,
            loadingClasses: true,
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
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            <Button onClick={() => this.setState({currentView: 'folderView'})}>
                                Tag Folder View
                            </Button>
                            <Button onClick={() => this.setState({currentView: 'tagTreeView'})}>
                                Tag Tree View
                            </Button>
                            <div style={{marginLeft: 'auto', padding: 15}}>
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

                        {this.state.currentView === 'folderView' && (
                            <FolderView classID={this.state.selectedClass.classID} />
                        )}
                        {this.state.currentView === 'tagTreeView' && (
                            <TreeView classID={this.state.selectedClass.classID} />
                        )}
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

    changeClass = () => {
        const {selectedClassName, classes} = this.state;
        if (selectedClassName !== 'Select class...') {
            const selectedClass = classes.find((c: Class) => c.name === selectedClassName);
            if (selectedClass) {
                this.setState({selectedClass});
            }
        }
    };
}
