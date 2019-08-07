import React, { Component } from "react";
import SortableTree from "react-sortable-tree";
import Http from "../../HelperFunctions/Http";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid/Grid";
import TextField from "@material-ui/core/TextField";
import * as Models from "../../Models";
export default class FolderView extends React.Component<
  {},
  Models.FolderViewState
> {
  constructor(props) {
    super(props);
    this.state = {
      tags: [],
      tagAddInput: "",
      tagDeleteInput: "",
      tagsFromServer: []
    };
    this.getTags();
  }
  render() {
    return (
      <React.Fragment>
        <CardContent>
          <div style={{ width: "100%", height: 600 }}>
            <SortableTree
              treeData={this.state.tags}
              onChange={tags => this.setState({ tags })}
            />
          </div>
        </CardContent>
        <CardActions
          style={{
            padding: 0,
            margin: 25,
            boxSizing: "border-box",
            marginTop: 60
          }}
        >
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="flex-start"
          >
            <Button variant="contained" onClick={() => this.addTag()}>
              Add new tag
            </Button>
            <TextField
              style={{
                margin: 0,
                width: 200,
                marginTop: -12,
                marginLeft: 10,
                marginRight: 10
              }}
              id="tag-input"
              label="New tag..."
              value={this.state.tagAddInput}
              onChange={e => this.setState({ tagAddInput: e.target.value })}
              margin="normal"
            />
            <Button variant="contained" onClick={() => this.deleteTag()}>
              Delete tag
            </Button>
            <TextField
              style={{ margin: 0, width: 200, marginTop: -12, marginLeft: 10 }}
              id="tag-input"
              label="Delete tag..."
              value={this.state.tagDeleteInput}
              onChange={e => this.setState({ tagDeleteInput: e.target.value })}
              margin="normal"
            />
            <div style={{ marginLeft: "auto" }}>
              <Button
                variant="contained"
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
      { tagName: this.state.tagAddInput },
      res => {
        const newTag = {
          id: res.tag,
          title: this.state.tagAddInput,
          children: [],
          childOrder: 0,
          parentId: null
        };
        const newTags = this.state.tags.concat(newTag);
        this.setState(
          {
            tags: newTags,
            tagAddInput: ""
          },
          () => this.getTags()
        );
      },
      err => {
        console.log(err);
      }
    );
  }
  putTags() {
    Http.putTags(
      this.formatTagsForServer(),
      res => {
        // console.log(res)
        this.getTags();
      },
      err => {
        console.log(err);
      }
    );
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
    let children = [];
    this.state.tags.forEach(tag => {
      children.push(this.getListOfChildren(tag.children, tag));
    });
    children.forEach(child => {
      child.forEach(ch => {
        parents.push(ch);
      });
    });
    const tags = parents;
    return tags;
  }
  getListOfChildren(parents: Models.Tag[], grandparent: Models.Tag) {
    let c = [];
    parents.forEach((child, i) => {
      if (Array.isArray(child))
        child.forEach((ch, j) => {
          c.push({
            TAG: ch.id,
            parent: grandparent.id || grandparent.TAG,
            tagName: ch.title,
            childOrder: j
          });
          if (ch.children != null && ch.children.length > 0)
            c = c.concat(this.getListOfChildren(ch.children, ch));
        });
      else {
        c.push({
          TAG: child.id,
          parent: grandparent.id || grandparent.TAG,
          tagName: child.title,
          childOrder: i
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
        let fixTree = false;
        this.setState({ tagsFromServer: res.tags });
        const tags = res.tags;
        const flatList = [];
        const parents = [];
        let tagCount = tags.length;
        tags.forEach(tag => {
          const hasParent = tags.find(t => tag.parent === t.TAG);
          flatList.push({
            id: tag.TAG,
            parentId: hasParent ? tag.parent : null,
            title: tag.tagName,
            childOrder: tag.childOrder
          });
          if (tag.parent && !hasParent) {
            fixTree = true;
          }
        });
        const addedAlready = [];
        while (tagCount > 0)
          flatList.forEach(tag => {
            if (
              !tag.parentId &&
              addedAlready.findIndex(id => tag.id === id) === -1
            ) {
              parents.push({
                parentId: null,
                id: tag.id,
                title: tag.title,
                children: [],
                childOrder: tag.childOrder
              });
              addedAlready.push(tag.id);
              tagCount -= 1;
            } else {
              if (this.checkChildren(tag, parents, addedAlready)) tagCount -= 1;
            }
          });
        parents.forEach(parent => {
          this.sortChildren(parent);
        });
        this.setState({ tags: parents }, () => {
          if (fixTree) {
            this.putTags();
          }
        });
      },
      err => {
        console.log(err);
      }
    );
  }
  deleteTag() {
    const tag = this.state.tagsFromServer.find(
      tag => tag.tagName === this.state.tagDeleteInput
    );
    Http.deleteTag(
      { TAG: tag.TAG },
      res => {
        this.setState({ tagDeleteInput: "" }, () => {
          this.getTags();
        });
      },
      err => {
        console.log(err);
      }
    );
  }
  sortChildren(parent) {
    parent.children.sort((a, b) => {
      return a.childOrder - b.childOrder;
    });
    parent.children.forEach(child => {
      this.sortChildren(child);
    });
  }
  checkChildren(tag, parents, addedAlready) {
    let found = false;
    parents.forEach(parent => {
      if (
        parent.id === tag.parentId &&
        !found &&
        addedAlready.findIndex(id => tag.id === id) === -1
      ) {
        found = true;
        parent.children.push({
          parentId: tag.parentId,
          id: tag.id,
          title: tag.title,
          childOrder: tag.childOrder,
          children: []
        });
        addedAlready.push(tag.id);
      }
    });
    if (!found) {
      parents.forEach(parent => {
        if (parent.children.length > 0)
          if (this.checkChildren(tag, parent.children, addedAlready))
            found = true;
      });
    }
    return found;
  }
}
