import {Paper, Typography} from '@material-ui/core';
import React from "react";

export function SelectableCourse(props: any) {
    return (
        <Paper className={'course-card'}>
            <Typography className={'card-header'}>{props.course.name}</Typography>
        </Paper>
    );
}
