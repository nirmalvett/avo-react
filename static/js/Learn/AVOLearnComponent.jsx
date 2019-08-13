import React, { Component } from 'react';
import * as Http from '../Http';
import Card from '@material-ui/core/Card';
import Tabs from '@material-ui/core/Tabs';
import List from '@material-ui/core/List';
import Input from '@material-ui/core/Input';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import Popper from '@material-ui/core/Popper';
import Tooltip from '@material-ui/core/Tooltip';
import Divider from '@material-ui/core/Divider';
import Collapse from '@material-ui/core/Collapse';
import ListItem from '@material-ui/core/ListItem';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Zoom from '@material-ui/core/Zoom';
import AVOMasteryGauge from './MasteryGauge';
import AVOLessonSlider from './AVOLessonSlider';

export default class AVOLearnComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lessons : []
        };
    };

    render() {
        if(this.state.lessons.length == 0) return (<div></div>);
        return (
            <Grid container xs={12} style={{flex: 1, display: 'flex', paddingBottom: 0, padding : '1em', position : 'relative', width : '98% !important'}} id="avo-learn__layout-div">
                <AVOLessonSlider changeToNewMastery={()=>this.changeToNewMastery()}slides={this.state.lessons} updateMastery={this.updateMastery}/>
            </Grid>
        );
    };

    componentDidMount() {
        this.getLessons()
    };
    getLessons = () => {
        Http.getLessons(
            (res) => {
                console.log(res);
                this.setState({ lessons : res.lessons });
            },
            (err) => {

            }
        );
    }
    updateMastery = (mastery, id) => {
        console.log("Updating", id, mastery)
        if (mastery && id) {
            const lessons = this.state.lessons
            const index = lessons.findIndex(lesson => lesson.ID === id)
            if (index !== -1) {
                lessons[index].newMastery = mastery
                this.setState({
                    lessons
                })
            }
        }
    }

    changeToNewMastery = () => {
        const lessons = this.state.lessons.map(lesson => {
            if (lesson.newMastery) {
                lesson.mastery = lesson.newMastery
            }
            return lesson
        })
        this.setState({lessons})
    }
    getGridStyleProperties(LIndex) {
        const styles = { padding: '1em', zIndex : this.state.lessons.length - LIndex, display : 'flex', position : 'relative'};
        return styles;
    };
};
