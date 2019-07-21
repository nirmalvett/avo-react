import { Typography } from '@material-ui/core';
import React from 'react'
import { getMathJax } from '../HelperFunctions/Utilities'
import { uniqueKey } from '../HelperFunctions/Helpers'
export default function LearnQuestionCard(props) {
    return (
        <div>
            <Typography color={props.color}>{getMathJax(props.prompt, props.promptVariant, uniqueKey())}</Typography>;
            {
                props.prompts.map(prompt => <Typography key={uniqueKey()} color={props.color}>{getMathJax(prompt, props.promptsVariant, uniqueKey())}</Typography>)
            }
        </div>
    )
}