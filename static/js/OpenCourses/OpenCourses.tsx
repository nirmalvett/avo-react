import React, {PureComponent} from 'react';
import {Paper, Typography} from '@material-ui/core';
import {SelectableCourse} from './SelectableCourse'
import * as Http from '../Http';
require('./OpenCourses.scss');
export default class OpenCourses extends PureComponent<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            courses: []
        };
        this.getOpenCourse();
    }
    render() {
        return (
            <div className={'selector-container'}>
                {
                    this.state.courses.map((course: any) => (
                        <SelectableCourse course={course} />
                    ))
                }
            </div>
        );
    }

    getOpenCourse = () => {
        Http.getOpenCourses(
            (res: any) => {
                this.setState({courses: res.courses})
            },
            (err: any) => {
                console.log(err)
            }
        )
    };
}
