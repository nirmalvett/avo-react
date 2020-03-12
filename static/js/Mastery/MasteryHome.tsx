import React, {Component, ReactElement} from 'react';
import {
    Grid,
    Paper,
    IconButton,
    Typography,
    Select,
    InputLabel,
    FormControl,
    Grow,
} from '@material-ui/core';
import {
    ChevronRight,
    ArrowBack,
    ArrowForward,
    SentimentVeryDissatisfied,
    SchoolOutlined,
} from '@material-ui/icons';
import * as Http from '../Http';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import AVOMasteryGauge from '../Learn/MasteryGauge';
import AVOMasteryChart from './AVOMasteryComps/MasteryChart';
import {GetSections_Section} from '../Http';

interface MasteryHomeProps {
    theme: {
        color: {
            '500': string;
        };
        theme: 'light' | 'dark';
    };
}

interface Concept {
    conceptID: number;
    name: string;
    lesson: string;
    type: number;
    parents: Concept[];
    children: Concept[];
    chartingData: never[];
    compAtTime: string[];
    comprehension: number;
}

interface MasteryHomeState {
    concepts: Concept[];
    edges: Http.GetConceptGraph['edges'];
    selectedConcepts: Concept[];
    activeConcept: Concept;
    currentIndex: number;
    sections: GetSections_Section[];
    loaded: boolean;
    sectionIndex: number;
}

export default class MasteryHome extends Component<MasteryHomeProps, MasteryHomeState> {
    constructor(props: MasteryHomeProps) {
        super(props);
        this.state = {
            concepts: [],
            edges: [],
            selectedConcepts: [],
            activeConcept: (null as unknown) as Concept,
            currentIndex: 0,
            sections: [],
            loaded: false,
            sectionIndex: 0,
        };
        this.getSlideTranslation = this.getSlideTranslation.bind(this);
        this.goToPreviousSlide = this.goToPreviousSlide.bind(this);
        this.goToNextSlide = this.goToNextSlide.bind(this);
    }

    componentDidMount() {
        this.getClasses();
        this.getLessons();
    }

    render() {
        return (
            <div style={{width: '-webkit-fill-available'}}>
                {this.state.selectedConcepts.length !== 0 && (
                    <Grow in={this.state.selectedConcepts.length !== 0}>
                        <Grid container spacing={8}>
                            <Grid item xs={1} />
                            <Grid item xs={10}>
                                <Paper
                                    className='avo-card'
                                    style={{
                                        padding: '1em',
                                        width: 'auto',
                                        height: '70vh',
                                        maxHeight: '70vh',
                                        overflowY: 'hidden',
                                    }}
                                >
                                    <Grid container>
                                        <Grid item xs={1}>
                                            <span style={{float: 'left', marginLeft: '8px'}}>
                                                <IconButton
                                                    color='primary'
                                                    onClick={this.goToPreviousSlide}
                                                    aria-label='Go Back'
                                                >
                                                    <ArrowBack />
                                                </IconButton>
                                            </span>
                                        </Grid>
                                        <Grid item xs={10} style={{position: 'relative'}}>
                                            {this.getDropdownSlides()}
                                        </Grid>
                                        <Grid item xs={1}>
                                            <span style={{float: 'right', marginRight: '8px'}}>
                                                <IconButton
                                                    color='primary'
                                                    onClick={this.goToNextSlide}
                                                    aria-label='Go Forward'
                                                >
                                                    <ArrowForward />
                                                </IconButton>
                                            </span>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl
                                            variant='outlined'
                                            style={{
                                                width: '200px',
                                                float: 'right',
                                                marginTop: '-1em',
                                            }}
                                        >
                                            <InputLabel htmlFor='classSelectionBase' />
                                            <Select
                                                className='avo-select'
                                                native
                                                onChange={event => {
                                                    this.setState({
                                                        sectionIndex: event.target.value as number,
                                                    });
                                                    setTimeout(this.loadInConceptData, 10);
                                                }}
                                                input={
                                                    <OutlinedInput
                                                        id='classSelectionBase'
                                                        labelWidth={20}
                                                    />
                                                }
                                            >
                                                {this.state.sections.map((avo_class, index) => {
                                                    return (
                                                        <option
                                                            value={index}
                                                            key={avo_class.sectionID}
                                                        >
                                                            {avo_class.name}
                                                        </option>
                                                    );
                                                })}
                                            </Select>
                                        </FormControl>

                                        <Typography
                                            style={{marginTop: '0.5em'}}
                                            variant='h6'
                                            gutterBottom
                                        >
                                            {this.state.activeConcept.name}
                                        </Typography>
                                        <Grid container>
                                            <Grid item xs={8}>
                                                {this.state.activeConcept.chartingData.length >
                                                2 ? (
                                                    <AVOMasteryChart
                                                        theme={this.props.theme}
                                                        dataPoints={
                                                            this.state.activeConcept.chartingData
                                                        }
                                                        dataLabels={
                                                            this.state.activeConcept.compAtTime
                                                        }
                                                        height='400px'
                                                    />
                                                ) : (
                                                    <div style={{marginTop: '20%'}}>
                                                        <SentimentVeryDissatisfied
                                                            style={{
                                                                display: 'block',
                                                                marginLeft: 'auto',
                                                                marginRight: 'auto',
                                                            }}
                                                        />
                                                        <br />
                                                        <Typography
                                                            style={{
                                                                width: '100%',
                                                                textAlign: 'center',
                                                            }}
                                                            variant='body1'
                                                        >
                                                            Not enough charting data to display
                                                            anything.
                                                        </Typography>
                                                    </div>
                                                )}
                                            </Grid>
                                            <Grid item xs={4}>
                                                <AVOMasteryGauge
                                                    theme={this.props.theme}
                                                    comprehension={
                                                        this.state.activeConcept.comprehension
                                                    }
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>
                            <Grid item xs={1} />
                        </Grid>
                    </Grow>
                )}
            </div>
        );
    }

    getDropdownSlides() {
        let combinedOutput: ReactElement[] = [];
        let output: ReactElement[] = [];
        const _this = this;
        output.push(
            <Grid container xs={4}>
                <Grid item xs={2}>
                    <div style={{marginTop: '1em'}}>
                        <SchoolOutlined />
                    </div>
                </Grid>
                <Grid item xs={10}>
                    <FormControl variant='outlined' style={{width: '91%'}}>
                        <InputLabel htmlFor='contextSelectionBase' />
                        <Select
                            className='avo-select'
                            native
                            onClick={() => {
                                _this.setState({activeConcept: _this.state.selectedConcepts[0]});
                            }}
                            onChange={event => {
                                let selectedTagsCopy = [
                                    _this.state.concepts[
                                        _this.state.concepts
                                            .filter(x => x.parents.length === 0)
                                            .map(x => x.conceptID)
                                            .indexOf(parseInt(event.target.value as string))
                                    ],
                                ];
                                _this.setState({
                                    selectedConcepts: selectedTagsCopy,
                                    activeConcept: selectedTagsCopy[0],
                                });
                            }}
                            input={<OutlinedInput id='contextSelectionBase' labelWidth={20} />}
                        >
                            {this.state.concepts
                                .filter(x => x.parents.length === 0)
                                .map(tag => {
                                    return (
                                        <option value={tag.conceptID} key={tag.conceptID}>
                                            {tag.name}
                                        </option>
                                    );
                                })}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>,
        );
        for (let i = 0; i < this.state.selectedConcepts.length; i++) {
            if (this.filterTags(this.state.selectedConcepts[i].conceptID).length === 0) continue;
            output.push(
                <Grid container xs={4}>
                    <Grid item xs={2}>
                        <Grow in={true}>
                            <div style={{marginTop: '1em'}}>
                                <ChevronRight />
                            </div>
                        </Grow>
                    </Grid>
                    <Grid item xs={10}>
                        <Grow in={true}>
                            <FormControl variant='outlined' style={{width: '92%'}}>
                                <InputLabel htmlFor={`contextSelectionBase-${i}`} />
                                <Select
                                    native
                                    className='avo-select'
                                    key={`@key:select=${i}-${_this.state.selectedConcepts[i].conceptID}`}
                                    onClick={() => {
                                        const thisTag = _this.state.selectedConcepts[i + 1];
                                        if (!!thisTag)
                                            _this.setState({
                                                activeConcept: _this.state.selectedConcepts[i + 1],
                                            });
                                    }}
                                    onChange={event => {
                                        let selectedTagsCopy = _this.state.selectedConcepts;
                                        selectedTagsCopy = selectedTagsCopy.splice(0, i + 1);
                                        let childTag = _this
                                            .filterTags(selectedTagsCopy[i].conceptID)
                                            .filter(
                                                x =>
                                                    x.conceptID ==
                                                    parseInt(event.target.value as string),
                                            );
                                        selectedTagsCopy.push(childTag[0]);
                                        if ((i + 2) % 3 == 0)
                                            setTimeout(() => _this.goToNextSlide(), 300);
                                        _this.setState({
                                            selectedConcepts: selectedTagsCopy,
                                            activeConcept: childTag[0],
                                        });
                                    }}
                                    input={
                                        <OutlinedInput
                                            id={`contextSelectionBase-${i}`}
                                            labelWidth={20}
                                        />
                                    }
                                >
                                    <option value={0} selected disabled>
                                        None
                                    </option>
                                    {this.filterTags(this.state.selectedConcepts[i].conceptID).map(
                                        concept => {
                                            return (
                                                <option value={concept.conceptID}>
                                                    {concept.name}
                                                </option>
                                            );
                                        },
                                    )}
                                </Select>
                            </FormControl>
                        </Grow>
                    </Grid>
                </Grid>,
            );
        }
        let currentElsInCombined = 0;
        let combinedOutputIndex = 0;
        let combination: ReactElement[] = [];
        output.forEach((el, index) => {
            combination.push(el);
            currentElsInCombined++;
            if (currentElsInCombined % 3 === 0 || index === output.length - 1) {
                combinedOutput[combinedOutputIndex] = (
                    <Grid
                        container
                        xs={12}
                        spacing={6}
                        style={{
                            position: 'absolute',
                            transition: 'transform 500ms ease-in, opacity 500ms ease-in',
                            willChange: 'transform',
                            opacity: combinedOutput.length == this.state.currentIndex ? 1 : 0,
                            top: '1.25em',
                            transform: `translateX(${this.getSlideTranslation(
                                combinedOutput.length,
                            )}vw)`,
                        }}
                    >
                        {combination}
                    </Grid>
                );
                combinedOutputIndex++;
                combination = [];
            }
        });
        return combinedOutput;
    }

    getSlideTranslation = (index: number) => {
        if (index < this.state.currentIndex) return -65;
        if (index > this.state.currentIndex) return 65;
        return 0;
    };

    goToPreviousSlide = () => {
        const currentIndex = this.state.currentIndex;
        if (currentIndex == 0) return;
        this.setState({currentIndex: currentIndex - 1});
    };

    goToNextSlide = () => {
        const currentIndex = this.state.currentIndex;
        if (
            currentIndex >
            Math.ceil(this.state.selectedConcepts.length / 3) +
                this.filterTags(this.state.activeConcept.conceptID).length -
                2
        )
            return;
        this.setState({currentIndex: currentIndex + 1});
    };

    filterTags(pTagCriteria: number) {
        return this.state.concepts.filter(tag =>
            tag.parents.some(x => x.conceptID == pTagCriteria),
        );
    }

    getLessons() {
        // Http.getLessons(
        //     res => {
        //         console.log(res);
        //         this.setState({lessons: res.lessons});
        //     },
        //     () => {},
        // );
    }

    loadInConceptData = () => {
        const selectedSectionID = this.state.sections[this.state.sectionIndex].sectionID;
        Http.getConceptGraph(
            selectedSectionID,
            ({concepts, edges}) => {
                Http.getConcepts(
                    // todo: change this to the get mastery history route when it exists
                    selectedSectionID,
                    () => {
                        // let timestamps = r.masteryTimestamps;
                        const mappedConcepts = concepts.map(concept => {
                            // const relatedTimeStamp: {mastery: number, timestamp: number}[] = timestamps[concept.conceptID];
                            // concept.comprehension = !!relatedTimeStamp
                            //     ? Math.floor(relatedTimeStamp[relatedTimeStamp.length - 1].mastery * 100)
                            //     : 0;
                            // concept.chartingData = !!relatedTimeStamp
                            //     ? relatedTimeStamp.map(ts => Math.floor(ts.mastery * 100))
                            //     : [];
                            // concept.compAtTime = !!relatedTimeStamp
                            //     ? relatedTimeStamp.map(
                            //           ts => getDateString(ts.timestamp).split(' at')[0],
                            //       )
                            //     : [];

                            return {
                                ...concept,
                                parents: edges
                                    .filter(x => x.child === concept.conceptID)
                                    .map(
                                        x =>
                                            concepts.find(y => y.conceptID === x.parent) as Concept,
                                    ),
                                children: edges
                                    .filter(x => x.parent === concept.conceptID)
                                    .map(
                                        x => concepts.find(y => y.conceptID === x.child) as Concept,
                                    ),
                                chartingData: [],
                                compAtTime: [],
                                comprehension: Math.random(),
                            };
                        });
                        this.setState({concepts: mappedConcepts}, () => {
                            const activeConcept = this.state.concepts.filter(
                                x => x.parents.length === 0,
                            )[0];
                            this.setState({selectedConcepts: [activeConcept], activeConcept});
                        });
                    },
                    e => console.log(e),
                );
            },
            err => {
                console.log(err);
            },
        );
    };

    getClasses() {
        Http.getSections(
            result => {
                this.setState({
                    sections: result.sections,
                    loaded: true,
                });
                setTimeout(this.loadInConceptData.bind(this), 10);
            },
            result => {
                console.log(result);
            },
        );
    }
}
