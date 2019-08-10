import React, {Component} from 'react';
import SortableTree from 'react-sortable-tree';
import * as Http from '../../Http';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid/Grid';
import TextField from '@material-ui/core/TextField';

interface Tag {
    tagID: number;
    parentId: number | null;
    childOrder: number;
    children: Tag[];
    title: string;
}

interface FolderViewProps {}

interface FolderViewState {
    tags: Tag[];
    tagAddInput: string;
    tagDeleteInput: string;
    tagsFromServer: {
        tagID: number;
        childOrder: number;
        parent: number;
        tagName: string;
    }[];
}

export default class FolderView extends Component<FolderViewProps, FolderViewState> {
    constructor(props: FolderViewProps) {
        super(props);
        this.state = {
            tags: [],
            tagAddInput: '',
            tagDeleteInput: '',
            tagsFromServer: [],
        };
        this.getTags();
    }

    render() {
        return (
            <React.Fragment>
                <CardContent>
                    <div style={{width: '100%', height: 600}}>
                        <SortableTree
                            treeData={this.state.tags}
                            onChange={(tags: Tag[]) => this.setState({tags})}
                        />
                    </div>
                </CardContent>
                <CardActions
                    style={{
                        padding: 0,
                        margin: 25,
                        boxSizing: 'border-box',
                        marginTop: 60,
                    }}
                >
                    <Grid container direction='row' justify='flex-start' alignItems='flex-start'>
                        <Button variant='contained' onClick={() => this.addTag()}>
                            Add new tag
                        </Button>
                        <TextField
                            style={{
                                margin: 0,
                                width: 200,
                                marginTop: -12,
                                marginLeft: 10,
                                marginRight: 10,
                            }}
                            id='tag-input'
                            label='New tag...'
                            value={this.state.tagAddInput}
                            onChange={e => this.setState({tagAddInput: e.target.value})}
                            margin='normal'
                        />
                        <Button variant='contained' onClick={() => this.deleteTag()}>
                            Delete tag
                        </Button>
                        <TextField
                            style={{margin: 0, width: 200, marginTop: -12, marginLeft: 10}}
                            id='tag-input'
                            label='Delete tag...'
                            value={this.state.tagDeleteInput}
                            onChange={e => this.setState({tagDeleteInput: e.target.value})}
                            margin='normal'
                        />
                        <div style={{marginLeft: 'auto'}}>
                            <Button
                                variant='contained'
                                onClick={() => {
                                    this.putTags();
                                }}
                            >
                                Save
                            </Button>
                        </div>
                    </Grid>
                </CardActions>
            </React.Fragment>
        );
    }

    addTag() {
        Http.addTag(
            this.state.tagAddInput,
            res => {
                const newTag = {
                    tagID: res.tagID,
                    title: this.state.tagAddInput,
                    children: [],
                    childOrder: 0,
                    parentId: null,
                };
                const newTags: Tag[] = [...this.state.tags, newTag];
                this.setState(
                    {
                        tags: newTags,
                        tagAddInput: '',
                    },
                    () => this.getTags(),
                );
            },
            err => {
                console.log(err);
            },
        );
    }

    putTags() {
        Http.putTags(this.formatTagsForServer(), this.getTags, console.log);
    }

    formatTagsForServer() {
        const parents: Http.PutTagsArg = this.state.tags.map((tag, i) => ({
            tagID: tag.tagID,
            parent: null,
            tagName: tag.title,
            childOrder: i,
        }));
        const children = this.state.tags.map(tag => this.getListOfChildren(tag.children, tag));
        children.forEach(child =>
            child
                .map(t => ({
                    tagID: t.tagID,
                    parent: t.parentId,
                    tagName: t.title,
                    childOrder: t.childOrder,
                }))
                .forEach(ch => parents.push(ch)),
        );
        return parents;
    }

    getListOfChildren(parents: Tag[], grandparent: Tag): Tag[] {
        let c: Tag[] = [];
        parents.forEach((child, i) => {
            if (Array.isArray(child))
                child.forEach((ch, j) => {
                    c.push({
                        tagID: ch.id,
                        parentId: grandparent.tagID || grandparent.tagID,
                        title: ch.title,
                        childOrder: j,
                        children: [],
                    });
                    if (ch.children != null && ch.children.length > 0)
                        c = c.concat(this.getListOfChildren(ch.children, ch));
                });
            else {
                c.push({
                    tagID: child.tagID,
                    parentId: grandparent.tagID || grandparent.tagID,
                    title: child.title,
                    childOrder: i,
                    children: [],
                });
                if (child.children != null && child.children.length > 0)
                    c = c.concat(this.getListOfChildren(child.children, child));
            }
        });
        return c;
    }

    getTags = () => {
        Http.getTags(
            res => {
                let fixTree = false;
                this.setState({tagsFromServer: res.tags});
                const tags = res.tags;
                const flatList: Tag[] = [];
                const parents: Tag[] = [];
                let tagCount = tags.length;
                tags.forEach(tag => {
                    const hasParent = tags.find(t => tag.parent === t.tagID);
                    flatList.push({
                        tagID: tag.tagID,
                        parentId: hasParent ? tag.parent : null,
                        title: tag.tagName,
                        childOrder: tag.childOrder,
                        children: [],
                    });
                    if (tag.parent && !hasParent) {
                        fixTree = true;
                    }
                });
                const addedAlready: number[] = [];
                while (tagCount > 0)
                    flatList.forEach(tag => {
                        if (
                            !tag.parentId &&
                            addedAlready.findIndex(id => tag.tagID === id) === -1
                        ) {
                            parents.push({
                                parentId: null,
                                tagID: tag.tagID,
                                title: tag.title,
                                children: [],
                                childOrder: tag.childOrder,
                            });
                            addedAlready.push(tag.tagID);
                            tagCount -= 1;
                        } else {
                            if (this.checkChildren(tag, parents, addedAlready)) tagCount -= 1;
                        }
                    });
                parents.forEach(parent => {
                    this.sortChildren(parent);
                });
                this.setState({tags: parents}, () => {
                    if (fixTree) {
                        this.putTags();
                    }
                });
            },
            err => {
                console.log(err);
            },
        );
    };

    deleteTag() {
        const tag = this.state.tagsFromServer.find(
            tag => tag.tagName === this.state.tagDeleteInput,
        );
        Http.deleteTag(
            (tag as {tagID: number}).tagID,
            () =>
                this.setState({tagDeleteInput: ''}, () => {
                    this.getTags();
                }),
            console.warn,
        );
    }

    sortChildren(parent: Tag) {
        parent.children.sort((a, b) => a.childOrder - b.childOrder);
        parent.children.forEach(child => this.sortChildren(child));
    }

    checkChildren(tag: Tag, parents: Tag[], addedAlready: number[]) {
        let found = false;
        parents.forEach(parent => {
            if (
                parent.tagID === tag.parentId &&
                !found &&
                addedAlready.findIndex(id => tag.tagID === id) === -1
            ) {
                found = true;
                parent.children.push({
                    parentId: tag.parentId,
                    tagID: tag.tagID,
                    title: tag.title,
                    childOrder: tag.childOrder,
                    children: [],
                });
                addedAlready.push(tag.tagID);
            }
        });
        if (!found) {
            parents.forEach(parent => {
                if (parent.children.length > 0)
                    if (this.checkChildren(tag, parent.children, addedAlready)) found = true;
            });
        }
        return found;
    }
}
