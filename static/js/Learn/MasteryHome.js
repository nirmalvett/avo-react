import React, { Component } from 'react';
import {
    Grid, Paper, IconButton, Typography, Select, InputLabel, FormControl, Grow
} from '@material-ui/core';
import {
    ChevronRight, ChevronLeft, BookmarkBorder, ArrowBack, ArrowForward
} from '@material-ui/icons';
import * as Http from '../Http';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import AVOMasteryGauge from './MasteryGauge';
import AVOMasteryChart from './AVOMasteryComps/MasteryChart';
import AVODynamicBackground from '../SharedComponents/AVODynamicBackground';
import {getDateString} from '../HelperFunctions/Utilities';

export default class MasteryHome extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tags          : [],
            selectedTags  : [],
            activeTag     : null,
            currentIndex  : 0,
            classes       : [],
            lessons       : [],
            classesLoaded : false,
        };
        this.getSlideTranslation = this.getSlideTranslation.bind(this);
        this.goToPreviousSlide   = this.goToPreviousSlide  .bind(this);
        this.goToNextSlide       = this.goToNextSlide      .bind(this);
    };

    componentDidMount()
    {
        this.getClasses();
        this.getLessons();
    }

    render() {
        const _this = this;
        return (
            <div style={{ width: '-webkit-fill-available' }}>
                {this.state.selectedTags.length !== 0 && (
                    <Grow in={this.state.selectedTags.length !== 0}>
                        <Grid container spacing={8}>
                            <Grid item xs={1}/>
                            <Grid item xs={10}>
                                <Paper className='avo-card' style={{ padding : '1em', width : 'auto', height : '70vh', maxHeight : '70vh', overflowY : 'hidden' }}>
                                    <Grid container>
                                        <Grid item xs={1}>
                                            <span style={{ float : 'left', marginLeft : '8px' }}>
                                                <IconButton color="primary" onClick={this.goToPreviousSlide} aria-label="Go Back">
                                                    <ArrowBack />
                                                </IconButton>
                                            </span>
                                        </Grid>
                                        <Grid item xs={10} style={{ position : 'relative' }}>
                                            {this.getDropdownSlides()}
                                        </Grid>
                                        <Grid item xs={1}>
                                            <span style={{ float : 'right', marginRight : '8px' }}>
                                                <IconButton color="primary" onClick={this.goToNextSlide} aria-label="Go Forward">
                                                    <ArrowForward />
                                                </IconButton>
                                            </span>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl variant="outlined" style={{ width : '200px', float : 'right', marginTop : '-1em' }}>
                                            <InputLabel htmlFor="classSelectionBase">
                                            </InputLabel>
                                            <Select
                                                className='avo-select'
                                                native
                                                onChange={(event) => {}}
                                                input={
                                                    <OutlinedInput 
                                                        id="classSelectionBase"
                                                    />
                                                }
                                            >
                                                {
                                                    this.state.classes.map((avo_class) => {
                                                        return (
                                                            <option value={avo_class.classID} key={avo_class.classID}>{avo_class.name}</option>
                                                        );
                                                    })
                                                }
                                            </Select>
                                        </FormControl>
                          
                                        <Typography style={{ marginTop : '0.5em' }} variant="h6" gutterBottom>
                                            {`${this.getRelevantTag().tagName}`}
                                        </Typography>
                                        <Grid container>
                                            <Grid item xs={8}>
                                                <AVOMasteryChart theme={this.props.theme} dataPoints={this.getRelevantTag().chartingData} dataLabels={this.getRelevantTag().compAtTime} height='400px'/>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <AVOMasteryGauge theme={this.props.theme} comprehension={this.getRelevantTag().comprehension}/>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>
                            <Grid item xs={1}/>
                        </Grid>
                    </Grow>
                )}      
            </div>
        );
    };

    getArrayFromStateChange() {
        let length = parseInt(Math.random( 12 ) * 10);
        let output = [];
        let l2 = parseInt(Math.random(4) * 10);
        for(let i = 0; i < length; i++) {
            output.push([]);
            for(let j = 0; j < 3; j++) {
                let num = parseInt(Math.random(9) * 10) * 10;
                output[i].push(num);
            }
        }
        return output;
    }

    getRelevantTag() {
        return this.state.activeTag;
    };

    getLineChart() {
        const options = this.getChartOptions();
        const series  = this.getSeriesData();
        return (
            <Chart
                options={options}
                series={series}
                type="line"
                width='100%'
                height='400px'
            />
        );
    };

    getSeriesData() {
        return[{
            name: 'Comprehension',
            type: 'line',
            data: this.state.selectedTags[Math.max(this.state.selectedTags.length - 1, 0)].chartingData
        }];
    };

    getDropdownSlides() {
        let combinedOutput = [];
        let output = [];
        const _this = this;
        output.push(
            <Grid container xs={4}>
                <Grid item xs={2}>
                    <div style={{ marginTop : '1em' }}>
                        <BookmarkBorder/>
                    </div>
                </Grid>
                <Grid item xs={10}>
                    <FormControl variant="outlined" style={{ width : '91%' }}>
                        <InputLabel htmlFor="contextSelectionBase">

                        </InputLabel>
                        <Select
                            className='avo-select'
                            native
                            onClick={() => { _this.setState({ activeTag : _this.state.selectedTags[0] }); }}
                            onChange={(event) => {
                                let selectedTagsCopy = [_this.state.tags[_this.filterTags(null).map(x => x.TAG).indexOf(parseInt(event.target.value))]];
                                _this.setState({ selectedTags : selectedTagsCopy, activeTag : selectedTagsCopy[0] });
                            }}
                            input={
                                <OutlinedInput 
                                    id="contextSelectionBase"
                                />
                            }
                        >
                            {
                                this.filterTags(null).map((tag) => {
                                    return (
                                        <option value={tag.TAG} key={tag.TAG}>{tag.tagName}</option>
                                    );
                                })
                            }
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
        );
        for(let i = 0; i < this.state.selectedTags.length; i++) {
            if(this.filterTags(this.state.selectedTags[i].TAG).length === 0) continue;
            output.push(
                <Grid container xs={4}>
                    <Grid item xs={2}>
                        <Grow in={true}>
                            <div style={{ marginTop : '1em' }}>
                                <ChevronRight/>
                            </div>
                        </Grow>
                    </Grid>
                    <Grid item xs={10}>
                        <Grow in={true}>
                            <FormControl variant="outlined" style={{ width : '92%' }}>
                                <InputLabel htmlFor={`contextSelectionBase-${i}`}>

                                </InputLabel>
                                <Select
                                    native
                                    className='avo-select'
                                    key={`@key:select=${i}-${_this.state.selectedTags[i].TAG}`}
                                    onClick={(event) => {
                                        const thisTag = _this.state.selectedTags[i + 1];
                                        if(!!thisTag)
                                            _this.setState({ activeTag : _this.state.selectedTags[i + 1] });
                                    }}
                                    onChange={(event) => {
                                        let selectedTagsCopy = _this.state.selectedTags;
                                        selectedTagsCopy = selectedTagsCopy.splice(0, i + 1);
                                        let childTag = _this.filterTags(selectedTagsCopy[i].TAG).filter(x => x.TAG == parseInt(event.target.value));
                                        selectedTagsCopy.push(childTag[0]);
                                        if((i + 2) % 3 == 0) 
                                            setTimeout(() => _this.goToNextSlide(), 300);
                                        _this.setState({ selectedTags : selectedTagsCopy, activeTag : childTag[0] });
                                    }}
                                    input={
                                        <OutlinedInput 
                                            id={`contextSelectionBase-${i}`}
                                        />
                                    }
                                >
                                    <option value={0} selected disabled>None</option>
                                    {
                                        this.filterTags(this.state.selectedTags[i].TAG).map((tag) => {
                                            return (
                                                <option value={tag.TAG}>{tag.tagName}</option>
                                            );
                                        })
                                    }
                                </Select>
                            </FormControl>
                        </Grow>
                    </Grid>
                </Grid>
            );
        }        
        let currentElsInCombined = 0;
        let combinedOutputIndex  = 0;
        let combination          = [];
        output.forEach((el, index) => {
            combination.push(el);
            currentElsInCombined++;
            if(currentElsInCombined % 3 === 0 || index === output.length - 1)
            {
                combinedOutput[combinedOutputIndex] = (
                    <Grid container xs={12} spacing={6} style={{
                        position   : 'absolute',
                        transition : 'transform 500ms ease-in, opacity 500ms ease-in',
                        willChange : 'transform',
                        opacity    : `${combinedOutput.length == this.state.currentIndex ? 1 : 0}`,
                        top        : '1.25em',
                        transform  : `translateX(${this.getSlideTranslation(combinedOutput.length)}vw)`

                    }}>
                        {combination}
                    </Grid>
                );
                combinedOutputIndex++;
                combination = [];
            }
        });
        return combinedOutput;
    };

    getSlideTranslation = (index) => {
        if(index < this.state.currentIndex)
            return -65;
        if(index > this.state.currentIndex)
            return 65;
        return 0;
    };

    goToPreviousSlide = () => {
        const currentIndex = this.state.currentIndex;
        if(currentIndex == 0)
            return;
        this.setState({ currentIndex : currentIndex - 1 });
    };

    goToNextSlide = () => {
        const currentIndex = this.state.currentIndex;
        if(currentIndex > (Math.ceil(this.state.selectedTags.length / 3) +  
            this.filterTags(
                this.state.activeTag.TAG
            ).length) - 2
        )
            return;
        this.setState({ currentIndex : currentIndex + 1 });
    };

    filterTags(pTagCriteria) {
        return this.state.tags.filter((tag) => tag.parent == pTagCriteria);
    }

    getLessons() {
        Http.getLessons(
            (res) => {
                console.log(res);
                this.setState({ lessons : res.lessons });
            },
            () => {}
        );
    };

    getClasses() {
        const _this = this;
        Http.getClasses(
            result => {
                this.setState({
                    classes: result.classes,
                    classesLoaded: true,
                });
                Http.getTags(
                    result.classes[0].classID,
                    res => {
                        Http.getTagTimeStamps(
                            result.classes[0].classID,
                            r => {
                                let tags = res.tags;
                                let timestamps = r.masteryTimestamps;
                                let classTag = tags[0];
                                tags.shift();
                                tags.map((tag) => {
                                    const relatedTimeStamp = timestamps[tag.tagID];
                                    tag.TAG = tag.tagID;
                                    if(tag.parent == classTag.tagID) tag.parent = null;
                                    tag.comprehension = !!relatedTimeStamp ? parseInt(relatedTimeStamp[relatedTimeStamp.length - 1].mastery * 100) : 0;
                                    tag.chartingData = !!relatedTimeStamp ? relatedTimeStamp.map(ts => parseInt(ts.mastery * 100)) : [];
                                    tag.compAtTime = !!relatedTimeStamp ? relatedTimeStamp.map(ts => getDateString(new Date(ts.timestamp)).split(' at')[0]) : [];
                                    return tag;
                                });
                                console.log(tags);
                                this.setState({ tags : tags });
                                setTimeout(() => {
                                    const availableTags = [this.filterTags(null)[0]];
                                    this.setState({ selectedTags : availableTags, activeTag : availableTags[0] });
                                }, 10);
                            },
                            e => console.log(e)
                        );
                    },
                    err => {
                        console.log(err);
                    },
                );
            },
            result => {
                console.log(result);
            },
        );
    };

    getTags() {
        this.setState({ tags : [
            {'tagName': 'Linear Algebra'       , 'TAG': 0, 'parent': null, 'childOrder': 0, 'chartingData' : [60,40,30,40,50], 'compAtTime': ['Jan. 12 2019', 'Feb. 12 2019', 'Mar. 12 2019', 'Apr. 12 2019', 'Jun. 12 2019'], 'comprehension' : 96 },
            {'tagName': 'Vector Operations'    , 'TAG': 1, 'parent': null, 'childOrder': 0, 'chartingData' : [20,20,30,40,60], 'compAtTime': ['Jan. 12 2019', 'Feb. 12 2019', 'Mar. 12 2019', 'Apr. 12 2019', 'Jun. 12 2019'], 'comprehension' : 49 },
            {'tagName': 'Vector Operations 1 1', 'TAG': 2, 'parent': 1   , 'childOrder': 0, 'chartingData' : [30,20,23,40,77, 99], 'compAtTime': ['Jan. 12 2019', 'Feb. 12 2019', 'Mar. 12 2019', 'Apr. 12 2019', 'Jun. 12 2019', 'Jul. 12 2019'], 'comprehension' : 69 },
            {'tagName': 'Vector Operations 1 2', 'TAG': 3, 'parent': 1   , 'childOrder': 0, 'chartingData' : [40,20,70,40,50], 'compAtTime': ['Jan. 12 2019', 'Feb. 12 2019', 'Mar. 12 2019', 'Apr. 12 2019', 'Jun. 12 2019'], 'comprehension' : 85 },
            {'tagName': 'Vector Operations 2 1', 'TAG': 4, 'parent': 3   , 'childOrder': 0, 'chartingData' : [45,11,30,99,89], 'compAtTime': ['Jan. 12 2019', 'Feb. 12 2019', 'Mar. 12 2019', 'Apr. 12 2019', 'Jun. 12 2019'], 'comprehension' : 74 },
            {'tagName': 'Vector Operations 2 2', 'TAG': 5, 'parent': 3   , 'childOrder': 0, 'chartingData' : [98,20,30,40,50], 'compAtTime': ['Jan. 12 2019', 'Feb. 12 2019', 'Mar. 12 2019', 'Apr. 12 2019', 'Jun. 12 2019'], 'comprehension' : 90 },
            {'tagName': 'Vector Operations 0 1', 'TAG': 6, 'parent': 5   , 'childOrder': 0, 'chartingData' : [60,20,30,12,90], 'compAtTime': ['Jan. 12 2019', 'Feb. 12 2019', 'Mar. 12 2019', 'Apr. 12 2019', 'Jun. 12 2019'], 'comprehension' : 78 },
            {'tagName': 'Vector Operations 0 1', 'TAG': 7, 'parent': 6   , 'childOrder': 0, 'chartingData' : [60,20,30,12,90], 'compAtTime': ['Jan. 12 2019', 'Feb. 12 2019', 'Mar. 12 2019', 'Apr. 12 2019', 'Jun. 12 2019'], 'comprehension' : 78 },
            {'tagName': 'Vector Operations 0 1', 'TAG': 8, 'parent': 7   , 'childOrder': 0, 'chartingData' : [60,20,30,12,90], 'compAtTime': ['Jan. 12 2019', 'Feb. 12 2019', 'Mar. 12 2019', 'Apr. 12 2019', 'Jun. 12 2019'], 'comprehension' : 78 },
            {'tagName': 'Vector Operations 0 1', 'TAG': 9, 'parent': 8   , 'childOrder': 0, 'chartingData' : [60,20,30,12,90], 'compAtTime': ['Jan. 12 2019', 'Feb. 12 2019', 'Mar. 12 2019', 'Apr. 12 2019', 'Jun. 12 2019'], 'comprehension' : 78 },
            {'tagName': 'Vector Operations 0 1', 'TAG': 10, 'parent': 9   , 'childOrder': 0, 'chartingData' : [60,20,30,12,90], 'compAtTime': ['Jan. 12 2019', 'Feb. 12 2019', 'Mar. 12 2019', 'Apr. 12 2019', 'Jun. 12 2019'], 'comprehension' : 78 },
         ] });
    };

};
