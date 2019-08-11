import React, { Component } from 'react';
import AVOLessonFSM         from './AVOLessonFSM';
import AVOMasteryGauge      from './MasteryGauge';
import AVOLearnTestComp     from './AVOLearnTestComp';
import Icon                 from '@material-ui/core/Icon';
import Grid                 from '@material-ui/core/Grid';
import Card                 from '@material-ui/core/Card';
import Http                 from '../HelperFunctions/Http';
import Typography           from '@material-ui/core/Typography';
import IconButton           from '@material-ui/core/IconButton';

export default class AVOLessonSlider extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            currentLesson : {},
            currentIndex  : 0,
            changedCurrency: 0,
        };
        
        this.processSlidesIntoGroups = this.processSlidesIntoGroups.bind(this);
        this.getSlideTranslation     = this.getSlideTranslation    .bind(this);
        this.getSlideRenderable      = this.getSlideRenderable     .bind(this);
        this.goToPreviousSlide       = this.goToPreviousSlide      .bind(this);
        this.goToNextSlide           = this.goToNextSlide          .bind(this);
        this.openLessonFSM           = this.openLessonFSM          .bind(this);
        
        this.slides = this.processSlidesIntoGroups(this.props.slides);
        this.fsmRef = React.createRef();
    };

    render() {
        return (
            <Grid container size={12} id='avo-lesson__layout-div'>
                <Grid xs={1} style={{ zIndex : 10 }}>
                    <center>
                        <IconButton 
                            aria-label="chevron_left" 
                            onClick={this.goToPreviousSlide} 
                            color="primary" 
                            style={{ marginTop : '25vh' }}
                        >
                            <Icon>chevron_left</Icon>
                        </IconButton>
                    </center>
                </Grid>
                <Grid xs={10} style={{ position : 'relative' }}>
                    {this.getSlideRenderable()}
                </Grid>
                <Grid xs={1} style={{ zIndex : 10 }}>
                    <center>
                        <IconButton 
                            aria-label="chevron_right" 
                            onClick={this.goToNextSlide} 
                            color="primary" 
                            style={{ marginTop : '25vh' }}
                        >
                            <Icon>chevron_right</Icon>
                        </IconButton>
                    </center>
                </Grid>
                <AVOLessonFSM changeToNewMastery={this.props.changeToNewMastery} ref={this.fsmRef}>
                    {!!this.state.currentLesson && (
                        <AVOLearnTestComp 
                            lesson={this.state.currentLesson} updateMastery={this.props.updateMastery}
                        />
                    )}
                </AVOLessonFSM>
            </Grid>
        );
    };

    getSlideRenderable = () => {
        const output = [];
        this.slides.forEach((group, gIndex) => {
            let slideGroup = [];
            group.forEach((lesson, LIndex) => {
                slideGroup.push(
                    <Grid item xs={4}>
                        <Card
                            className={`avo-card`}
                            style={{
                                padding       : '10px',
                                flex          : 1,
                                margin        : 'none',
                                width         : 'auto',
                                display       : 'flex',
                                height        : '50vh',
                                position      : 'relative',
                                flexDirection : 'column',
                            }}
                            id= {`avo-lesson__card-${LIndex}-${gIndex}`}
                            key={`avo-learn__card-key:${LIndex}`}
                        >   
                            <IconButton 
                                onClick={(e) => this.openLessonFSM(e, lesson, `${LIndex}-${gIndex}`)} 
                                color="primary" 
                                aria-label="fullscreen" 
                                style={{ 
                                    position : 'absolute', 
                                    right    : '0.125em', 
                                    top      : '0.125em',
                                    zIndex   : '10' 
                                }}
                            >
                                <Icon>fullscreen</Icon>
                            </IconButton>
                            <AVOMasteryGauge 
                                comprehension={parseInt(parseFloat(lesson.newMastery || lesson.mastery) * 100)}
                                colors={['#399103', '#039124', '#809103']}
                            />
                            <Typography variant={'title'}>{lesson.Tag}</Typography>
                            <Typography variant={'caption'}>{lesson.string.substring(0, 20)}...</Typography>
                        </Card>
                    </Grid>
                );
            })
            output.push(
                <Grid container xs={12} spacing={6} style={{
                    position   : 'absolute',
                    transition : 'transform 1s ease-in',
                    willChange : 'transform',
                    transform  : `translateX(${this.getSlideTranslation(gIndex)}vw)`
                }}>
                    {slideGroup}
                </Grid>
            );
        });
        return output;
    }; 

    getSlideTranslation = (index) => {
        if(index < this.state.currentIndex)
            return -75;
        if(index > this.state.currentIndex)
            return 75;
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
        if(currentIndex > this.slides.length - 2) 
            return;
        this.setState({ currentIndex : currentIndex + 1 });
    };

    processSlidesIntoGroups = (slides) => {
        const output     = [];
        let slideCounter = 0;
        let groupCounter = -1;
        slides.forEach(slide => {
            if(slideCounter === 0) {
                output.push([]);
                groupCounter++;
            };
            output[groupCounter].push(slide);
            if(slideCounter == 2) 
                slideCounter = 0; 
            else
                slideCounter++;
        });
        return output;
    };

    openLessonFSM = (event, lesson, LIndex) => {
        Http.getLessonData(
            lesson.ID, 
            (res) => { 
                console.log(res); 
                lesson.data = res;
                this.setState({ currentLesson : lesson });
                this.fsmRef.current.handleFSM(event, lesson, LIndex);
            },
            (err) => { console.log(err); },
        );
    };
};