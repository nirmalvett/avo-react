import { Typography, Input } from "@material-ui/core";
import React from "react";

export default function Message(props) {
  return (
    <div style={props.message.selected ? {textDecoration: "line-through", color: "red"}: {}}>
      <Typography component={"span"} variant="h4" color="textPrimary">
        {props.message.title}
      </Typography>
      <Typography component={"span"} variant="body1" color="textPrimary">
        {props.message.body}
      </Typography>
      <br />
    </div>
  );
}
