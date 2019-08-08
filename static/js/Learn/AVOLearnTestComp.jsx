import React, { Component } from 'react';
import AVOMasteryGauge      from './MasteryGauge';
import LearnQuestionCard    from "./LearnQuestionCard";
import Icon                 from '@material-ui/core/Icon';
import Grid                 from '@material-ui/core/Grid';
import Http                 from '../HelperFunctions/Http';
import AnswerInput          from '../AnswerInput/AnswerInput'
import Typography           from '@material-ui/core/Typography';
import IconButton           from '@material-ui/core/IconButton';
import Button               from '@material-ui/core/Button';
import * as Helpers 		from '../HelperFunctions/Utilities'
import { CropPortrait } 	from '@material-ui/icons';
import Grow                 from '@material-ui/core/Grow';
import AVOLearnTestCongrat  from './AVOLearnTestCongrat';

const TestStates = {
	Lesson          : 'LESSON',
	Questions       : 'QUESTIONS',
	TestEnd         : 'TESTEND'
};

export default class AVOLearnTestComp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            questionIndex 		: 0,
            newAnswers    		: this.props.lesson.data.questions.map(q => ''),
            currentState  		: TestStates.TestEnd,
            questionState      	: 1,
            currentExplanation 	: [],
            testEndState        : 0
            explanations 	: this.props.lesson.data.questions.map(q => ''),
        };
        this.getSlideTranslation = this.getSlideTranslation.bind(this);
        this.goToPreviousSlide   = this.goToPreviousSlide  .bind(this);
        this.goToNextSlide       = this.goToNextSlide      .bind(this);
        console.log(this);
    };

	render() {
		return (
			<div style={{ width : '100%', position : 'relative' }}>
				{this.state.currentState === TestStates.Lesson && (
					<Grid container spacing={8}>
						<Grid item xs={8}>
							<Typography variant={'title'}>{this.props.lesson.Tag}</Typography>
							<Typography variant={'caption'}>{this.props.lesson.string}</Typography>
						</Grid>
						<Grid item xs={4}>
							<div
								className={`avo-card`} 
								style={{ 
									position 	  : 'relative',
									padding       : '10px',
	                                flex          : 1,
	                                margin        : 'none',
	                                width         : 'auto',
	                                display       : 'flex',
	                                height        : '50vh', 
	                                flexDirection : 'column',
	                                border        : 'none'
								}}
							>
								<AVOMasteryGauge 
									comprehension={parseInt(parseFloat(this.props.lesson.mastery) * 100)}
	                                colors={['#399103', '#039124', '#809103']}
	                            />
							</div>
							 <Button 
							 	variant="outlined" 
							 	color="primary" 
							 	onClick={() => this.setState({ currentState : TestStates.Questions })}
							 	style={{ float : 'right' }}
							>
						        Go to test
						    </Button>
						</Grid>
					</Grid>
				)}
				{this.state.currentState === TestStates.Questions && (
					<Grow in={true} timeout={{ enter : 1000 }}>
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
							<div style={{ position : 'absolute', left : '0.25em', top : '0.25em' }}>
								<Button 
									onClick={() => this.setState({ currentState : TestStates.Lesson })}
									variant="outlined" 
								 	color="primary" 
								>
									Go Back To Lesson
								</Button>
							</div>
						</Grid>
					</Grow>
				)}
				{this.state.currentState === TestStates.TestEnd && (
					<React.Fragment>
						<Grow in={this.state.testEndState === 0} timeout={{ enter : 1000, exit : 500 }}> 
							<div style={{ position : 'absolute', width : '100%' }}>
								<div
									className={`avo-card`} 
									style={{ 
										position 	  : 'relative',
										padding       : '10px',
		                                flex          : 1,
		                                margin        : 'none',
		                                width         : 'auto',
		                                display       : 'flex',
		                                overflow      : 'hidden',
		                                height        : '50vh', 
		                                flexDirection : 'column',
		                                border        : 'none'
									}}
								>
									<AVOLearnTestCongrat 
		                                colors={['#399103', '#039124', '#809103']}
		                            />
								</div>
							</div>
						</Grow>
						<Grow in={this.state.testEndState === 1} timeout={{ enter : 1500 }}>
							<Grid container spacing={8} style={{ position : 'absolute' }}>
								<Grid item xs={8}>
									<Typography variant={'title'}>{this.props.lesson.Tag}</Typography>
									<Typography variant={'caption'}>Explanations go here</Typography>
								</Grid>
								<Grid item xs={4}>
									<div
										className={`avo-card`} 
										style={{ 
											position 	  : 'relative',
											padding       : '10px',
			                                flex          : 1,
			                                margin        : 'none',
			                                width         : 'auto',
			                                display       : 'flex',
			                                height        : '50vh', 
			                                flexDirection : 'column',
			                                border        : 'none'
										}}
									>
										<AVOMasteryGauge 
											comprehension={parseInt(parseFloat(this.props.lesson.mastery) * 100)}
			                                colors={['#399103', '#039124', '#809103']}
			                            />
										<Typography variant={'caption'}>Improved {this.props.lesson.Tag} by 10%</Typography>
									</div>
								</Grid>
							</Grid>
						</Grow>
					</React.Fragment>
				)}
			</div>
		);
	};

	goToPreviousSlide = () => {
		const currentIndex = this.state.questionIndex;
		if(currentIndex == 0) 
			return;
		this.setState({ 
			questionIndex : currentIndex - 1, 
			questionState : !!this.state.questionState ? 0 : 1 
		});
	};

	goToNextSlide = () => {
		const currentIndex = this.state.questionIndex;
		if(currentIndex > (this.props.lesson.data.questions.length * 2) - 2) 
			this.switchToTestEnd();
		this.setState({ 
			questionIndex : currentIndex + 1, 
			questionState : !!this.state.questionState ? 0 : 1 
		});
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
                <div style={{
                    position   : 'absolute',
                    transition : 'transform 1s ease-in',
                    willChange : 'transform',
                    transform  : `translateX(${this.getSlideTranslation(output.length)}vw)`,
                    width      : '100%',
                    marginTop  : '5em',
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
                                console.log(newAnswerList)
                                this.getExplanation(newAnswerList, question, index)
                            }}
                        />
                    </center>
                </div>
            );

            // Explanation Pushexplanations
            output.push(
                <div style={{
                    position   : 'absolute',
                    transition : 'transform 1s ease-in',
                    willChange : 'transform',
                    transform  : `translateX(${this.getSlideTranslation(output.length)}vw)`,
                }}>
                	<br/>
                	<br/>
                	<br/>
                    {
                        (this.state.newAnswers[index] && <div>
                            <h1>{ Helpers.getMathJax(this.state.explanations[index], 'body2', index) }</h1>
                            </div>) ||
                        (!this.state.newAnswers[index] && <div>
                            <Typography variant={'title'}>Previous Question is missing an answer, therefore no explanation is available.</Typography>
                        </div>)
                    }
                </div>
            );
        });
        return output;
    };

    getExplanation(answers, question, index) {
        console.log(answers)
        console.log(question)
        const _this = this;
        Http.getLessonQuestionResult(
            question.ID,
            [answers[index]], 
            question.seed, 
            res => {
                console.log(res)
                const temp = this.state.explanations;
                temp[index] = res.explanation[0];
                this.setState({explanations: temp})
            }, 
            err => {
                console.log(err)
            }
        );
    };

    switchToTestEnd() {
    	this.setState({ currentState : TestStates.TestEnd });
    	setTimeout(() => {
    		this.setState({ testEndState : 1 });
    	}, 3000);
    };
};