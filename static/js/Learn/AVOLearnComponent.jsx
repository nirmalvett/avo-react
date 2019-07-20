import React, { Component } from 'react';
import Http from '../HelperFunctions/Http';

export default class AVOLearnComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lessons : []
        };
    };

    render() {
        if(this.state.lessons.length == 0) return (<div>Getting Lessons</div>);
        return (
            <div>
                Hello world
                {this.state.lessons.map((lesson) => (
                    <div>
                        {lesson.string}
                    </div>
                ))}
            </div>
        );
    };

    componentDidMount() {
        Http.getLessons(
            (res) => {
                console.log(res);
                this.setState({ lessons : res.lessons });
            },
            (err) => {

            }
        );
    };
};