import { Typography } from "@material-ui/core";
import React from "react";
import { getMathJax } from "../HelperFunctions/Utilities";
import { uniqueKey } from "../HelperFunctions/Helpers";
import * as Models from "../Models";
import Card from "@material-ui/core/Card/Card";
export default function LearnLessonCard(props: Models.LearnLessonCardProps) {
  return (
    <Card style={{padding: 50}}>
      <div>{getMathJax(props.title, props.promptVariant, uniqueKey())}</div>
      <div>{getMathJax(props.body, props.promptVariant, uniqueKey())}</div>
    </Card>
  );
}
