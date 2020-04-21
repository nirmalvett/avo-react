import React, {Component} from 'react';
import {Typography} from '@material-ui/core';
import * as Http from '../Http';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import {SelectableCourse} from '../OpenCourses/SelectableCourse'
import {CourseModal} from "../OpenCourses/CourseModal";
require('../OpenCourses/OpenCourses.scss');
export default class Profile extends Component<{color: {'200': string; '500': string}}, any> {
    state = {
        user: {} as any,
        userFromURL: window.location.pathname.substr(6),
        selectedCourse: undefined,
        courseModalDisplay: 'hidden'
    };

    componentDidMount() {
        const {userFromURL} = this.state;
        console.log(userFromURL)
        if (userFromURL)
            Http.getProfile(
                userFromURL,
                (res: any) => {
                    console.log(res)
                    this.setState({user: res})
                },
                (res: any) => {
                    console.log(res)
                    this.setState({user: undefined})
                }
            )
        else
            this.setState({user: undefined})
    }

    render() {
        const {user, userFromURL, selectedCourse, courseModalDisplay} = this.state;
        const courses = user
            ?
            (user.courses || []).map((c: any) => (
                <SelectableCourse select={this.selectCourse} color={this.props.color} course={c}/>
            ))
            :
            [];
        return (
            <div
                style={{
                    width: '100%',
                    height: '90vh',
                    padding: 25,
                    overflow: 'auto',
                    marginTop: 0,
                }}
            >
                <Card style={{width: '100%', overflow: 'auto', marginBottom: 20}}>
                    <CardContent>
                        <div>
                            {user &&
                            (<div>
                                <Typography
                                    variant={'h1'}>{user.firstName} {user.lastName} aka {user.display_name}</Typography>
                                <br/>
                                <Typography
                                    variant={'h5'}>Country: {user.country || 'No country specified'}</Typography>
                                <br/>
                                <Typography
                                    variant={'h5'}>Language: {user.language || 'No language specified'}</Typography>
                                <br/>
                                <Typography>{user.description}</Typography>
                                <br/>
                                <Typography variant={'h1'}>Courses:</Typography>
                                <div className={'selector-container'}>
                                    {courses}
                                    {selectedCourse && <CourseModal
                                        modalDisplay={courseModalDisplay}
                                        hideModal={() => this.setState({courseModalDisplay: 'hidden', selectedCourse: undefined})}
                                        course={selectedCourse}
                                        enroll={this.enroll}
                                    />}
                                </div>
                            </div>)
                            ||
                            (<Typography variant={'h1'}>User {userFromURL} not found...</Typography>)
                            }
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

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
