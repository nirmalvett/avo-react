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
import TagBuilder from "./TagBuilder";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";

export default class TagView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buildView: true,
      tagsFromServer: [],
      tags: []
    };
    this.getTags();
  }

  render() {
    let view = <TagBuilder tags={this.state.tags} />;
    if (!this.state.buildView) view = <p>other Component here</p>;
    return (
      <div>
        <IconButton
          color="primary"
          aria-label="Swap views"
          onClick={() => this.setState({ buildView: !this.state.buildView })}
        >
          <Icon>autorenew</Icon>
        </IconButton>
        {view}
      </div>
    );
  }
  getTags() {
    Http.getTags(
      res => {
        const tags = res.tags;
        this.setState({ tagsFromServer: tags });
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
}
