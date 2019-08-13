import React, { Component } from "react";
import LearnExplanationContainer from "./LearnExplanationContainer";
import LearnQuestionCard from "./LearnQuestionCard";
import LearnLessonCard from "./LearnLessonCard";
// going to leave the state and props of this as any as I'm sure you'll need to change things
export default class LearnTestComponent extends Component<any, any> {
  constructor(props) {
    super(props);
    const states = {
      LESSON: "lesson",
      QUESTION: "question",
      EXPLANATION: "explanation",
      TRANSITION: "transition"
    };
    this.state = {
      states,
      currentState: states.LESSON
    };
  }
  // Any addition logic for switching between these states can be handled here
  changeToLessonState = () => {
    this.setState({ currentState: this.state.states.LESSON });
  };
  changeToQuestionState = () => {
    this.setState({ currentState: this.state.states.QUESTION });
  };
  changeToExplanationState = () => {
    this.setState({ currentState: this.state.states.EXPLANATION });
  };
  changeToTransitionState = () => {
    this.setState({ currentState: this.state.states.TRANSITION });
  };

  render() {
    return (
      (this.state.currentState === this.state.states.LESSON && (
        <div>
          <LearnLessonCard
            title={this.props.lessonTitle}
            body={this.props.lessonBody}
          />
          <button onClick={this.changeToQuestionState}>Go to question</button>
        </div>
      )) ||
      (this.state.currentState === this.state.states.QUESTION && (
        <div>
          <LearnQuestionCard
            prompt={this.props.questionPrompt}
            prompts={this.props.questionPrompts}
          />
          <button onClick={this.changeToExplanationState}>Submit answer</button>
        </div>
      )) ||
      (this.state.currentState === this.state.states.EXPLANATION && (
        <div>
          <LearnExplanationContainer
            skills={this.props.skills}
            explanations={this.props.explanations}
          />
          <button onClick={this.changeToTransitionState}>
            Go to end screen
          </button>
        </div>
      )) ||
      (this.state.currentState === this.state.states.TRANSITION && (
        // not sure how you want to handle this
        <div>
          <p>Handle returning back to home</p>
        </div>
      ))
    );
  }
}
