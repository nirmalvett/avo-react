import { Typography } from "@material-ui/core";
import React from "react";
import { getMathJax } from "../HelperFunctions/Utilities";
import { uniqueKey } from "../HelperFunctions/Helpers";
import * as Models from "../Models";
import Card from "@material-ui/core/Card/Card";

export default function LearnExplanationCard(
  props: Models.LearnExplanationCardProps
) {
  return (
    <Card style={{ padding: 50 }}>
      {getMathJax(props.explanation, props.promptVariant, uniqueKey())}
    </Card>
  );
}
