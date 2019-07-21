import { Typography } from '@material-ui/core';
import React from 'react'
import { getMathJax } from '../HelperFunctions/Utilities'
import { uniqueKey } from '../HelperFunctions/Helpers'
import * as Models from '../Models'
import Card from '@material-ui/core/Card/Card';
export default function LearnQuestionCard(props: Models.LearnLessonCardProps) {
    return (
        <Card>
            <Typography color={props.color}>{getMathJax(props.title, props.promptVariant, uniqueKey())}</Typography>;
            <Typography color={props.color}>{getMathJax(props.body, props.promptVariant, uniqueKey())}</Typography>;
        </Card>
    )
}