import React, { Component } from "react";
import { Typography } from "@material-ui/core";
import SortableTree from "react-sortable-tree";
import Http from "../../HelperFunctions/Http";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid/Grid";
import TextField from "@material-ui/core/TextField";

export default class TagBuilder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: [],
      tagInput: "", 
      currentView: 'folderView'
    };
    //views: folderView, tagTreeView
    this.getTags();
    this.tags = [];
  }

  render() {
    return (
      <div
        style={{
          width: 1000,
          height: 600,
          margin: 25,
          padding: 25,
          overflow: "hidden",
          marginTop: 0
        }}
      >
        <Card style={{ height: "100%", width: "100%" }}>
          <Button onClick={() => this.setState({ currentView : 'folderView' })}>Tag Folder View</Button>
          <Button onClick={() => { this.switchToTreeView() }}>Tag Tree View</Button>
          {this.state.currentView == 'folderView' && (
            <React.Fragment>
                <CardContent>
                    <div style={{ height: "80%", width: "100%" }}>
                    <SortableTree
                        treeData={this.state.tags}
                        onChange={tags => this.setState({ tags })}
                    />
                    </div>
                </CardContent>
                <CardActions>
                    <Grid
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="flex-start"
                    >
                    <Button
                        style={{ marginTop: "16px", marginRight: "20px" }}
                        variant="contained"
                        onClick={() => this.addTag()}
                    >
                        Add new tag
                    </Button>
                    <TextField
                        style={{ margin: 0, width: 400 }}
                        id="tag-input"
                        label="New tag..."
                        value={this.state.tagInput}
                        onChange={e => this.handleTagInput(e)}
                        margin="normal"
                    />
                    <div style={{ paddingLeft: '33%' }}>
                        <Button
                        style={{ marginTop: "16px", float: "right" }}
                        variant="contained"
                        onClick={() => {}}
                        >
                        Save
                        </Button>
                    </div>
                    </Grid>
                </CardActions>
            </React.Fragment>
          )}
          {this.state.currentView == 'tagTreeView' && (
            <div id="cy" style={{"width": '800px', "height": '800px'}}>
        
            </div>
          )}
          
        </Card>
      </div>
    );
  }
  addTag() {
    const newTag = {
      id: -1,
      title: this.state.tagInput,
      children: []
    };
    const newTags = this.state.tags.concat(newTag);
    Http.addTag(
      { tagName: newTag.title },
      res => {
        console.log(res);
      },
      err => {
        console.log(err);
      }
    );
    this.setState({
      tags: newTags,
      tagInput: ""
    });
  }
  putTags() {
    Http.putTags(
      this.formatTagsForServer(),
      res => {
        console.log(res)
      },
      err => {
        console.log(err)
      }
    )
  }
  formatTagsForServer() {
    const parents = this.state.tags.map((tag, i) => {
      return {
        TAG: tag.id,
        parent: null,
        tagName: tag.title,
        childOrder: i
      };
    });
    let children = []
    this.state.tags.forEach(tag => {
      children.push(this.getListOfChildren(tag.children, tag))
    })
    children.forEach((child)=>{
      child.forEach((ch)=>{
        parents.push(ch)
      })
    })
    const tags = parents
    return tags;
  }
  getListOfChildren(parents, grandparent) {
    let c = [];
    parents.forEach((child, i) => {
      if (Array.isArray(child))
        child.forEach(ch => {
          c.push({
            TAG: ch.id,
            parent: grandparent.id == null ? grandparent.TAG : grandparent.id,
            tagName: ch.title,
            childOrder: ch.childOrder
          });
          if (ch.children != null && ch.children.length > 0)
            c = c.concat(this.getListOfChildren(ch.children, ch));
        });
      else {
        c.push({
          TAG: child.id,
          parent: grandparent.id == null ? grandparent.TAG : grandparent.id,
          tagName: child.title,
          childOrder: child.childOrder,
        });
        if (child.children != null && child.children.length > 0)
          c = c.concat(this.getListOfChildren(child.children, child));
      }
    });
    return c;
  }
  getTags() {
    Http.getTags(
      res => {
        const tags = res.tags;
        this.tags = tags;
        const flatList = [];
        const parents = [];
        let tagCount = tags.length;
        tags.forEach(tag => {
          flatList.push({
            id: tag.TAG,
            parentId: tag.parent,
            title: tag.tagName,
            childOrder: tag.childOrder
          });
        });
        while (tagCount > 0)
          flatList.forEach(tag => {
            if (tag.parentId == null) {
              parents.push({
                parentId: null,
                id: tag.id,
                title: tag.title,
                children: [],
                childOrder: tag.childOrder
              });
              tagCount -= 1;
            } else {
              if (this.checkChildren(tag, parents)) tagCount -= 1;
            }
          });
        this.setState({ tags: parents });
      },
      err => {
        console.log(err);
      }
    );
  }
  checkChildren(tag, parents) {
    let found = false;
    parents.forEach(parent => {
      if (parent.id === tag.parentId) {
        found = true;
        parent.children.push({
          parentId: tag.parentId,
          id: tag.id,
          title: tag.title,
          childOrder: tag.childOrder,
          children: []
        });
      }
    });
    if (found === false) {
      parents.forEach(parent => {
        if (parent.children.length > 0)
          if (this.checkChildren(tag, parent.children)) found = true;
      });
    }
    return found;
  }
  switchToTreeView() 
  {
      this.setState({ currentView : 'tagTreeView' });
      setTimeout(() => {
        console.log(this.tags);
        const data = this.tags;
        var nodes = [];
        var edges = [];

        data.forEach(function(el) {
            nodes.push({ 
                data : {
                    id : 'node-' + el.TAG,
                },
                style : {
                    content : el.tagName 
                }
            });
            if(el.parent !== null) 
            {
                edges.push({ data: { target: 'node-' + el.TAG , source: 'node-' + el.parent } });
            }
        });

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
                nodes : nodes,
                edges : edges
                // nodes: [
                // { data: { id: 'n0' } },
                // { data: { id: 'n1' } },
                // { data: { id: 'n2' } },
                // { data: { id: 'n3' } },
                // { data: { id: 'n4' } },
                // { data: { id: 'n5' } },
                // { data: { id: 'n6' } },
                // { data: { id: 'n7' } },
                // { data: { id: 'n8' } },
                // { data: { id: 'n9' } },
                // { data: { id: 'n10' } },
                // { data: { id: 'n11' } },
                // { data: { id: 'n12' } },
                // { data: { id: 'n13' } },
                // { data: { id: 'n14' } },
                // { data: { id: 'n15' } },
                // { data: { id: 'n16' } }
                // ],
                // edges: [
                // { data: { source: 'n0', target: 'n1' } },
                // { data: { source: 'n1', target: 'n2' } },
                // { data: { source: 'n1', target: 'n3' } },
                // { data: { source: 'n4', target: 'n5' } },
                // { data: { source: 'n4', target: 'n6' } },
                // { data: { source: 'n6', target: 'n7' } },
                // { data: { source: 'n6', target: 'n8' } },
                // { data: { source: 'n8', target: 'n9' } },
                // { data: { source: 'n8', target: 'n10' } },
                // { data: { source: 'n11', target: 'n12' } },
                // { data: { source: 'n12', target: 'n13' } },
                // { data: { source: 'n13', target: 'n14' } },
                // { data: { source: 'n13', target: 'n15' } },
                // ]
            }
            });
      }, 250);
  };
}
