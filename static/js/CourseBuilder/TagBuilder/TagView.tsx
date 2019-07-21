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
import TreeView from './TreeView'
import FolderView from './FolderView'
export default class TagView extends Component<any, any> {
  constructor(props) {
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
          overflow: "hidden",
        }}
      >
        <Card style={{ width: "100%", margin: 0, padding: 0, height: 790 }}>
          <Button onClick={() => this.setState({ currentView: 'folderView' })}>Tag Folder View</Button>
          <Button onClick={() => this.setState({ currentView: 'tagTreeView' })}>Tag Tree View</Button>
          {this.state.currentView == 'folderView' && (
            <FolderView />
          )}
          {this.state.currentView == 'tagTreeView' && (
            <TreeView />
          )}
        </Card>
      </div>
    );
  }
}