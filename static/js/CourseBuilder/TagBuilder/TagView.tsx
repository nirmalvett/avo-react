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
                    minWidth: 800,
                    minHeight: 500,
                    margin: 25,
                    overflow: 'hidden',
                }}
            >
                <Card style={{width: '100%', margin: 0, padding: 0, height: 790}}>
                    <Button onClick={() => this.setState({currentView: 'folderView'})}>
                        Tag Folder View
                    </Button>
                    <Button onClick={() => this.setState({currentView: 'tagTreeView'})}>
                        Tag Tree View
                    </Button>
                    {this.state.currentView === 'folderView' && <FolderView />}
                    {this.state.currentView === 'tagTreeView' && <TreeView />}
                </Card>
            </div>
        );
    }
}
