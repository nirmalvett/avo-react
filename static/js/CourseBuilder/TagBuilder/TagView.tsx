import React, {Component} from 'react';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import TreeView from './TreeView';
import FolderView from './FolderView';

interface TagViewProps {}

interface TagViewState {
    currentView: string;
}

export default class TagView extends Component<TagViewProps, TagViewState> {
    constructor(props: TagViewProps) {
        super(props);
        this.state = {
            currentView: 'folderView',
        };
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
                <Card style={{width: '100%', margin: 0, padding: 0, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                        <Button onClick={() => this.setState({currentView: 'folderView'})}>
                            Tag Folder View
                        </Button>
                        <Button onClick={() => this.setState({currentView: 'tagTreeView'})}>
                            Tag Tree View
                        </Button>
                    </div>
                    {this.state.currentView === 'folderView' && <FolderView />}
                    {this.state.currentView === 'tagTreeView' && <TreeView />}
                </Card>
            </div>
        );
    }
}
