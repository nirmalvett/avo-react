import {Paper, Typography} from '@material-ui/core';
import React from "react";
import {OpenCourse} from '../Http/'
interface props {
    select: (course: OpenCourse)=>void;
    course: OpenCourse;
    color: {'200': string, '500': string}
}
export function SelectableCourse(props: props) {
    return (
        <Paper onClick={() => props.select(props.course)} className={'course-card'} style={{backgroundColor: props.color[500]}}>
            <Typography className={'card-header'}>{props.course.courseName}</Typography>
        </Paper>
    );
}
