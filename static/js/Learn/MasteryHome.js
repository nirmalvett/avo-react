import React, { Component } from 'react';
import {
	Grid, Paper, IconButton, Typography, Select, InputLabel, FormControl
} from '@material-ui/core';
import {
	ChevronRight, ChevronLeft, BookmarkBorder
} from '@material-ui/icons';
import * as Http from '../Http';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import AVOMasteryGauge from './MasteryGauge';
import AVOMasteryChart from './AVOMasteryComps/MasteryChart';

export default class MasteryHome extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tags : [],
            selectedTags: [],
            activeTag : null,
            currentIndex : 0,
        };
        this.getSlideTranslation = this.getSlideTranslation.bind(this);
        this.goToPreviousSlide   = this.goToPreviousSlide  .bind(this);
        this.goToNextSlide       = this.goToNextSlide      .bind(this);
    };

    componentDidMount()
    {
        this.getTags();
        setTimeout(() => {
            const availableTags = [this.filterTags(null)[0]];
            this.setState({ selectedTags : availableTags, activeTag : availableTags[0] });
        }, 10);
    }

    render() {
        const _this = this;
        if(this.state.selectedTags.length == 0) return <div>Getting concept data, please wait</div>;
        return (
            <Grid container spacing={8}>
                <Grid item xs={1}/>
                <Grid item xs={10}>
                    <Paper className='avo-card' style={{ padding : '1em', width : 'auto' }}>
                        <Grid container>
                            <Grid item xs={1}>
                                <center>
                                    <IconButton onClick={this.goToPreviousSlide} aria-label="Go Back">
                                        <ChevronLeft />
                                    </IconButton>
                                </center>
                            </Grid>
                            <Grid item xs={10}>
                                {this.getDropdownSlides()}
                            </Grid>
                            <Grid item xs={1}>
                                <center>
                                    <IconButton onClick={this.goToNextSlide} aria-label="Go Forward">
                                        <ChevronRight />
                                    </IconButton>
                                </center>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <br/>
                            <Typography variant="h6" gutterBottom>
                                {`${this.getRelevantTag().tagName}`}
                            </Typography>
                            <Grid container>
                                <Grid item xs={8}>
                                    {/*<AVOBarChart dataPoints={this.getArrayFromStateChange()} labels={['a', 'b', 'c']} colors={['#399103', '#45af04', '#59e105']}height='400px'/>*/}
                                    <AVOMasteryChart dataPoints={this.getRelevantTag().chartingData} dataLabels={this.getRelevantTag().compAtTime} height='400px'/>
                                    {/* {this.getLineChart()} */}
                                </Grid>
                                <Grid item xs={4}>
                                    <AVOMasteryGauge comprehension={this.getRelevantTag().comprehension}/>
                                    {/* <Chart
                                        options={this.getDonutOptions()}
                                        series={this.getDonutData()}
                                        type="donut"
                                        width='100%'
                                        height='400px'
                                    /> */}
                                </Grid>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
                <Grid item xs={1}/>
            </Grid>
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
        console.log(this.state.activeTag);
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
                    <FormControl variant="outlined">
                        <InputLabel htmlFor="contextSelectionBase">

                        </InputLabel>
                        <Select
                            native
                            style={{
                                paddingBottom : '8px !important',
                                paddingTop : '8px !important'
                            }}
                            onClick={() => { _this.setState({ activeTag : _this.state.selectedTags[0] }); }}
                            onChange={(event) => {
                                let selectedTagsCopy = [_this.state.tags[_this.filterTags(null).map(x => x.TAG).indexOf(parseInt(event.target.value))]];
                                _this.setState({ selectedTags : selectedTagsCopy, activeTag : selectedTagsCopy[0] });
                            }}
                            input={
                                <OutlinedInput id="contextSelectionBase" />
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
                        <div style={{ marginTop : '1em' }}>
                            <ChevronRight/>
                        </div>
                    </Grid>
                    <Grid item xs={10}>
                        <FormControl variant="outlined">
                            <InputLabel htmlFor={`contextSelectionBase-${i}`}>

                            </InputLabel>
                            <Select
                                native
                                key={`@key:select=${i}-${_this.state.selectedTags[i].TAG}`}
                                style={{
                                    paddingBottom : '8px !important',
                                    paddingTop : '8px !important'
                                }}
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
                                    _this.setState({ selectedTags : selectedTagsCopy, activeTag : childTag[0] });
                                }}
                                input={
                                    <OutlinedInput id={`contextSelectionBase-${i}`}/>
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
                        transition : 'transform 1s ease-in',
                        willChange : 'transform',
                        top        : '2.25em',
                        width      : '85%',
                        transform  : `translateX(${this.getSlideTranslation(combinedOutput.length)}vw)`
                    }}>
                        {combination}
                    </Grid>
                );
                combinedOutputIndex++;
                combination = [];
            }
        });
        console.log(combinedOutput);
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
        if(currentIndex > Math.ceil(this.state.selectedTags.length / 3) )
            return;
        this.setState({ currentIndex : currentIndex + 1 });
    };

    filterTags(pTagCriteria) {
        return this.state.tags.filter((tag) => tag.parent == pTagCriteria);
    }

    handleChange(id, parentId) {

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
