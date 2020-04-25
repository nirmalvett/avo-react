import React, {PureComponent} from 'react';
import {SelectableCourse} from './SelectableCourse'
import * as Http from '../Http';
import {CourseModal} from "./CourseModal";
import {Typography} from "@material-ui/core";
import {OpenCourse, OpenCourseSection} from '../Http/'
require('./OpenCourses.scss');

export default class OpenCourses extends PureComponent<{ color: { '200': string; '500': string } },
    { courses: OpenCourse[], selectedCourse: OpenCourse | undefined, courseModalDisplay: string }> {
    constructor(props: { color: { '200': string; '500': string } }) {
        super(props);
        this.state = {
            courses: [],
            selectedCourse: undefined,
            courseModalDisplay: 'hidden'
        };
        this.getOpenCourse();
    }

    render() {
        const {selectedCourse, courseModalDisplay, courses} = this.state;
        const {color} = this.props;
        return (
            <div className={'selector-container'}>
                {courses.map((course: any) => (
                    <SelectableCourse select={this.selectCourse} color={color} course={course}/>))}
                {selectedCourse && <CourseModal
                    modalDisplay={courseModalDisplay}
                    hideModal={() => this.setState({courseModalDisplay: 'hidden', selectedCourse: undefined})}
                    course={selectedCourse}
                    enroll={this.enroll}
                />}
                {courses.length === 0 &&
                <Typography variant={'h1'}>There are currently no open courses :( Come back later...</Typography>}
            </div>
        );
    }


    getOpenCourse = () => {
        Http.getOpenCourses(
            (res: {courses: {courseID: number, courseName: string}[]}) => {
                console.log(res);
                this.setState({courses: res.courses})
            },
            (err) => {
                console.log(err);
            }
        )
    };

    selectCourse = (course: OpenCourse) => {
        console.log(course);
        Http.getOpenCourse(
            course.courseID,
            (res: {course: OpenCourse}) => {
                console.log(res);
                this.setState({selectedCourse: res.course, courseModalDisplay: 'block'})
            },
            (err) => {
                console.log(err)
            }
        )
    };

    enroll = (section: OpenCourseSection) => {
        Http.enrollOpenCourse(
            section.sectionID,
            (res: {}) => {
                console.log(res);
            },
            (err) => {
                console.log(err);
            }
        )
    };
}
