import React, {PureComponent} from 'react';
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
        const {selectedCourse, courseModalDisplay, courses} = this.state;
        const {color} = this.props;
        return (
            <div className={'selector-container'}>
                {courses.map((course: any) => (
                    <SelectableCourse color={color} select={this.selectCourse} course={course}/>))}
                {selectedCourse && <CourseModal
                    modalDisplay={courseModalDisplay}
                    hideModal={() => this.setState({courseModalDisplay: 'hidden', selectedCourse: undefined})}
                    course={selectedCourse}
                    enroll={this.enroll}
                />}
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

    enroll = (section: any) => {
        Http.enrollOpenCourse(
            section.sectionID,
            (res: any) => {
                console.log(res);
            },
            (err: any) => {
                console.log(err);
            }
        )
    };
}
