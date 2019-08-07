import React, { Component } from 'react';
import LearnQuestionCard    from "./LearnQuestionCard";
import Icon                 from '@material-ui/core/Icon';
import Grid                 from '@material-ui/core/Grid';
import Http                 from '../HelperFunctions/Http';
import AnswerInput          from '../AnswerInput/AnswerInput'
import Typography           from '@material-ui/core/Typography';
import IconButton           from '@material-ui/core/IconButton';

const TestStates = {
    Lesson          : 'LESSON',
    Questions       : 'QUESTIONS',
    TestEnd         : 'TESTEND'
};

export default class AVOLearnTestComp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            questionIndex : 0,
            newAnswers    : this.props.lesson.data.questions.map(q => ''),
            currentState  : TestStates.Lesson,
            questionState : 1
        };
        this.getSlideTranslation = this.getSlideTranslation.bind(this);
        this.goToPreviousSlide   = this.goToPreviousSlide  .bind(this);
        this.goToNextSlide       = this.goToNextSlide      .bind(this);
        console.log(this);
    };

    render() {
        return (
            <div style={{ width : '100%' }}>
                {this.state.currentState === TestStates.Lesson && (
                    <Grid container spacing={8}>
                        <Grid item xs={8}>
                            <Typography variant={'title'}>{this.props.lesson.Tag}</Typography>
                            <Typography variant={'caption'}>{this.props.lesson.string}</Typography>
                        </Grid>
                        <button onClick={() => this.setState({ currentState : TestStates.Questions })}>Go to test</button>
                    </Grid>
                )}
                {this.state.currentState === TestStates.Questions && (
                    <Grid container spacing={8}>
                        <Grid item xs={1}>
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
                        <Grid item xs={10} style={{ position : 'relative' }}>
                            {this.getQuestionsAndExplanations()}
                        </Grid>
                        <Grid item xs={1}>
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
                    </Grid>
                )}
                {this.state.currentState === TestStates.TestEnd && (
                    <p> Congrats test is over</p>
                )}
            </div>
        );
    };

    goToPreviousSlide = () => {
        const currentIndex = this.state.questionIndex;
        if(currentIndex == 0) 
            return;
        this.setState({ questionIndex : currentIndex - 1, questionState : !!this.state.questionState ? 0 : 1 });
    };

    goToNextSlide = () => {
        const currentIndex = this.state.questionIndex;
        console.log(this);
        if(currentIndex > (this.props.lesson.data.questions.length * 2) - 2) 
            return;
        this.setState({ questionIndex : currentIndex + 1, questionState : !!this.state.questionState ? 0 : 1 });
    };

    getSlideTranslation = (index) => {
        if(index < this.state.questionIndex)
            return -75;
        if(index > this.state.questionIndex)
            return 75;
        return 0;
    };

    getQuestionsAndExplanations() {
        let output = [];
        this.props.lesson.data.questions.forEach((question, index) => {
            // Question Body push
            output.push(
                !!this.state.questionState && <div style={{
                    position   : 'absolute',
                    transition : 'transform 1s ease-in',
                    willChange : 'transform',
                    transform  : `translateX(${this.getSlideTranslation(output.length)}vw)`,
                    width      : '100%',
                    marginTop  : '5em',
                    display    : `${!!this.state.questionState ? 'block' : 'none'}`
                }}>
                    <center>
                        <AnswerInput
                            type={question.types[0]}
                            value={this.state.newAnswers[index]} 
                            prompt={question.prompt}
                            onBlur={() => {
                                
                            }}
                            onChange={value => {
                                let newAnswerList = this.state.newAnswers;
                                newAnswerList[index] = value;
                                this.setState({newAnswers: newAnswerList});
                            }}
                            buttonSave={value => {
                                let newAnswerList = this.state.newAnswers;
                                newAnswerList[index] = value;
                                this.setState({newAnswers: newAnswerList});
                            }}
                        />
                    </center>
                </div>
            );

            // Explanation Push
            output.push(
                <div style={{
                    position   : 'absolute',
                    transition : 'transform 1s ease-in',
                    willChange : 'transform',
                    transform  : `translateX(${this.getSlideTranslation(output.length)}vw)`,
                    display    : `${!!this.state.questionState ? 'block' : 'none'}`
                }}>
                    Explanation
                </div>
            );
        });
        return output;
    };
};