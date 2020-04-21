import {Paper, Typography} from '@material-ui/core';
import React from "react";
interface props {
    select: (props: props)=>void;
    course: any;
    color: {'200': string, '500': string}
}
export function SelectableCourse(props: props) {
    return (
        <Paper onClick={() => props.select(props)} className={'course-card'} style={{backgroundColor: props.color[500]}}>
            <Typography className={'card-header'}>{props.course.name}</Typography>
        </Paper>
    );
}
