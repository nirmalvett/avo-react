import React from "react";
import { getMathJax } from "../HelperFunctions/Utilities";
import { uniqueKey } from "../HelperFunctions/Helpers";
import * as Models from "../Models/";
import Card from "@material-ui/core/Card/Card";
export default function LearnQuestionCard(
  props: Models.LearnQuestionCardProps
) {
  return (
    <Card style={{padding: 50}}>
      {getMathJax(props.prompt, props.promptVariant || "body1", uniqueKey())}
      {props.prompts.map(prompt => (
        <div key={uniqueKey()}>
          {getMathJax(prompt, props.promptsVariant || "body2", uniqueKey())}
        </div>
      ))}
    </Card>
  );
}
