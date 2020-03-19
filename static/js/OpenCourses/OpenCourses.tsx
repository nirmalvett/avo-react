import React, {PureComponent} from 'react';
import {Paper, Typography} from '@material-ui/core';
import {SelectableCourse} from './SelectableCourse'
import * as Http from '../Http';
import {CourseModal} from "./CourseModal";

require('./OpenCourses.scss');
export default class OpenCourses extends PureComponent<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            courses: [],
            selectedCourse: undefined,
            courseModalDisplay: 'hidden'
        };
        this.getOpenCourse();
    }

    render() {
        return (
            <div className={'selector-container'}>
                {
                    this.state.courses.map((course: any) => (
                        <SelectableCourse color={this.props.color} select={this.selectCourse} course={course}/>
                    ))
                }
                <CourseModal
                    modalDisplay={this.state.courseModalDisplay}
                    hideModal={() => this.setState({courseModalDisplay: 'hidden', selectedCourse: undefined})}
                    course={this.state.selectedCourse}
                />
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

    selectCourse = (course: any) => {
        console.log(course);
        Http.getOpenCourse(
            course.course.courseID,
            (res: any) => {
                console.log(res)
                this.setState({selectedCourse: res.course, courseModalDisplay: 'block'})
            },
            (err: any) => {
                console.log(err)
            }
        )
    };
}
