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
      tagInput: ""
    };
    this.getTags();
  }

  render() {
    return (
      <div
        style={{
          width: 1000,
          height: 600,
          margin: 5,
          padding: 5,
          overflow: "hidden"
        }}
      >
        <Card style={{ height: "100%", width: "100%" }}>
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
    this.setState({
      tags: newTags,
      tagInput: ""
    });
  }
  handleTagInput(event) {
    this.setState({ tagInput: event.target.value });
  }
  getTags() {
    Http.getTags(
      res => {
        const tags = res.tags;
        const flatList = [];
        const parents = [];
        let tagCount = tags.length;
        tags.forEach(tag => {
          flatList.push({
            id: tag.TAG,
            parentId: tag.parent,
            title: tag.tagName
          });
        });
        while (tagCount > 0)
          flatList.forEach(tag => {
            if (tag.parentId == null) {
              parents.push({
                id: tag.id,
                title: tag.title,
                children: []
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
          id: tag.id,
          title: tag.title,
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
}
