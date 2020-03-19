import {Paper, Typography} from '@material-ui/core';
import React from "react";

export function SelectableCourse(props: any) {
    return (
        <Paper onClick={() => props.select(props)} className={'course-card'} style={{backgroundColor: props.color[500]}}>
            <Typography className={'card-header'}>{props.course.name}</Typography>
        </Paper>
    );
}
